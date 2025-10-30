import os
import pickle
from typing import Optional, List, Dict, Any

import numpy as np
from fastapi import FastAPI, Header, HTTPException, Query
from huggingface_hub import hf_hub_download

APP_TOKEN = os.getenv("PY_SVC_TOKEN", "demo-secret")

# Sem Disk no Render: "./artifacts" (efêmero). Com Disk:  "/data"
ART_DIR = os.getenv("ART_DIR", "./artifacts")

HF_REPO_ID = os.getenv("HF_REPO_ID", "oiagod/recomendacao")

PKL_DF_NAME = os.getenv("PKL_DF_NAME", "produtos_df.pkl")                
COSINE_NPY_NAME = os.getenv("COSINE_NPY_NAME", "cosine_sim_matrix.npy")  # COSINE em .npy (mmap)

app = FastAPI()

df = None                       
cosine_sim: Optional[np.memmap] = None  

def _require_auth(x_auth: Optional[str]):
    if x_auth != APP_TOKEN:
        raise HTTPException(status_code=401, detail="unauthorized")

def _hf_download(filename: str) -> str:
    """
    Baixa 'filename' do Dataset HF para ART_DIR, se ainda não existir.
    Usa cache do HF e grava o arquivo real (sem symlink) em ART_DIR.
    """
    os.makedirs(ART_DIR, exist_ok=True)
    dest = os.path.join(ART_DIR, filename)
    if not os.path.exists(dest):
        print(f"[hf] baixando {filename} de {HF_REPO_ID}")
        got = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=filename,
            repo_type="dataset",
            local_dir=ART_DIR,
            local_dir_use_symlinks=False,
            resume_download=True,
        )
        if got != dest:
            os.replace(got, dest)
    try:
        size = os.path.getsize(dest)
    except OSError:
        size = -1
    print(f"[hf] ok: {dest} ({size:,} bytes)")
    return dest

def _artifacts_ok() -> bool:
    return (
        df is not None
        and cosine_sim is not None
        and hasattr(cosine_sim, "shape")
        and len(df) == cosine_sim.shape[0] == cosine_sim.shape[1]
    )

@app.on_event("startup")
def load_artifacts():
    global df, cosine_sim

    df_path = _hf_download(PKL_DF_NAME)
    with open(df_path, "rb") as f:
        loaded_df = pickle.load(f)

    cosine_path = _hf_download(COSINE_NPY_NAME)
    loaded_cosine = np.load(cosine_path, mmap_mode="r")

    if loaded_cosine.ndim != 2 or loaded_cosine.shape[0] != loaded_cosine.shape[1]:
        raise RuntimeError("cosine_sim_matrix.npy não é matriz NxN.")

    if len(loaded_df) != loaded_cosine.shape[0]:
        raise RuntimeError(
            f"Incompatibilidade: len(df)={len(loaded_df)} "
            f"vs cosine shape={loaded_cosine.shape}"
        )

    globals()["df"] = loaded_df
    globals()["cosine_sim"] = loaded_cosine

    print("[startup] df e cosine (mmap) prontos.",
          f"df_len={len(df)}, cosine_shape={cosine_sim.shape}")

@app.get("/healthz")
def healthz():
    ok = _artifacts_ok()
    return {
        "ok": True,
        "artifacts": ok,
        "repo": HF_REPO_ID,
        "dir": ART_DIR,
        "cosine_shape": getattr(cosine_sim, "shape", None),
        "df_len": len(df) if df is not None else None,
    }

@app.get("/recomendar")
def recomendar(
    prod_id: str = Query(..., alias="prod_id"),
    topk: int = 10,
    x_auth: Optional[str] = Header(None),
):
    _require_auth(x_auth)

    if not _artifacts_ok():
        raise HTTPException(status_code=503, detail="artifacts_unavailable")

    if topk <= 0:
        topk = 10
    if topk > 100:
        topk = 100

    try:
        idx_list = df.index[df["product_id"] == prod_id].tolist()
    except Exception:
        raise HTTPException(status_code=500, detail="df_sem_coluna_product_id")

    if not idx_list:
        raise HTTPException(status_code=404, detail=f"produto '{prod_id}' não encontrado")

    i = int(idx_list[0])

    sims = cosine_sim[i]  

    top_idx = np.argpartition(sims, -(topk + 1))[-(topk + 1):]
    top_idx = top_idx[np.argsort(sims[top_idx])[::-1]]

    top_idx = [j for j in top_idx if j != i][:topk]

    cols = ["product_id", "product_name", "rating", "img_link", "actual_price"]
    cols = [c for c in cols if c in df.columns]
    recs = df.iloc[top_idx][cols].to_dict(orient="records")
    return {"data": recs}