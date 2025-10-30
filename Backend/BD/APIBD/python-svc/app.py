# python-svc/app.py
import os
import pickle
from typing import Optional, List

from fastapi import FastAPI, Header, HTTPException, Query
from huggingface_hub import hf_hub_download

APP_TOKEN = os.getenv("PY_SVC_TOKEN", "demo-secret")

# Sem Disk no Render: "./artifacts" (efêmero).
# Com Disk no Render: "/data" e montar Disk no serviço.
ART_DIR = os.getenv("ART_DIR", "./artifacts")

HF_REPO_ID = os.getenv("HF_REPO_ID", "oiagod/recomendacao")

HF_TOKEN: Optional[str] = os.getenv("HF_TOKEN")

PKL_FILES: List[str] = [
    "produtos_df.pkl",
    "cosine_sim_matrix.pkl",
    "vectorizer.pkl",
    "tfidf_matrix.pkl",
]

app = FastAPI()

def _require_auth(x_auth: Optional[str]):
    if x_auth != APP_TOKEN:
        raise HTTPException(status_code=401, detail="unauthorized")

def _artefatos_ok() -> bool:
    return all(os.path.exists(os.path.join(ART_DIR, f)) for f in PKL_FILES[:2])

def _ensure_artifacts():
    """
    Baixa cada arquivo do dataset público no Hugging Face, usando huggingface_hub,
    com suporte a resume e gravação direta em ART_DIR.
    """
    os.makedirs(ART_DIR, exist_ok=True)
    for fname in PKL_FILES:
        dest = os.path.join(ART_DIR, fname)
        if os.path.exists(dest):
            try:
                size = os.path.getsize(dest)
            except OSError:
                size = -1
            print(f"[artifacts] já existe: {dest} ({size:,} bytes)")
            continue

        print(f"[artifacts] baixando via hf_hub: repo={HF_REPO_ID} arquivo={fname}")
        downloaded_path = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=fname,
            repo_type="dataset",            
            local_dir=ART_DIR,              # grava direto em ART_DIR
            local_dir_use_symlinks=False,   # grava arquivo real
            force_download=False,
            resume_download=True,
            token=HF_TOKEN,                 
        )

        # Garante o nome de destino (hf_hub pode retornar path interno do cache)
        if downloaded_path != dest:
            os.replace(downloaded_path, dest)

        try:
            size = os.path.getsize(dest)
        except OSError:
            size = -1
        print(f"[artifacts] OK: {dest} ({size:,} bytes)")

df = None
cosine_sim = None

@app.on_event("startup")
def load_artifacts():
    global df, cosine_sim
    _ensure_artifacts()
    if _artefatos_ok():
        with open(os.path.join(ART_DIR, "produtos_df.pkl"), "rb") as f:
            loaded_df = pickle.load(f)
        with open(os.path.join(ART_DIR, "cosine_sim_matrix.pkl"), "rb") as f:
            loaded_cosine = pickle.load(f)

        globals()["df"] = loaded_df
        globals()["cosine_sim"] = loaded_cosine
        print("[artifacts] carregados com sucesso.")
    else:
        print("[artifacts] faltando PKLs; healthz mostrará artifacts=false.")

@app.get("/healthz")
def healthz():
    ok = bool(df is not None and cosine_sim is not None)
    return {"ok": True, "artifacts": ok, "repo": HF_REPO_ID, "dir": ART_DIR}

@app.get("/recomendar")
def recomendar(
    prod_id: str = Query(..., alias="prod_id"),
    topk: int = 10,
    x_auth: Optional[str] = Header(None),
):
    _require_auth(x_auth)

    if df is None or cosine_sim is None:
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

    try:
        sims = cosine_sim[i]
    except Exception:
        raise HTTPException(status_code=500, detail="cosine_sim_incompativel_com_df")

    similar_idx = sims.argsort()[-(topk + 1):][::-1]
    similar_idx = [j for j in similar_idx if j != i][:topk]

    cols = ["product_id", "product_name", "rating", "img_link", "actual_price"]
    available_cols = [c for c in cols if c in df.columns]

    recs = df.iloc[similar_idx][available_cols].to_dict(orient="records")
    return {"data": recs}