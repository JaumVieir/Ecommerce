# Backend/BD/APIBD/python_svc/app.py
import os
import numpy as np
import pandas as pd
from typing import Optional
from fastapi import FastAPI, Header, HTTPException, Query
from scipy.sparse import load_npz, csr_matrix

APP_TOKEN = os.getenv("PY_SVC_TOKEN", "demo-secret")

ART_DIR = os.getenv(
    "ART_DIR",
    os.path.join(os.path.dirname(__file__), "artifacts")
)
DF_FILE = os.getenv("DF_FILE", "produtos_df.parquet")
TFIDF_FILE = os.getenv("TFIDF_FILE", "tfidf_matrix.npz")

app = FastAPI()

_df: Optional[pd.DataFrame] = None
_tfidf: Optional[csr_matrix] = None

def _require_auth(x_auth: Optional[str]):
    if x_auth != APP_TOKEN:
        raise HTTPException(status_code=401, detail="unauthorized")

@app.on_event("startup")
def load_artifacts():
    global _df, _tfidf
    df_path = os.path.join(ART_DIR, DF_FILE)
    tfidf_path = os.path.join(ART_DIR, TFIDF_FILE)

    if not os.path.exists(df_path) or not os.path.exists(tfidf_path):
        print(f"[artifacts] não encontrados em {ART_DIR}")
        return

    _df = pd.read_parquet(df_path).reset_index(drop=True)
    tfidf = load_npz(tfidf_path)
    if tfidf.dtype != np.float32:
        tfidf = tfidf.astype(np.float32)
    _tfidf = tfidf.tocsr()

    print("[artifacts] df + tfidf carregados")

@app.get("/healthz")
def healthz():
    return {"ok": True, "artifacts": bool(_df is not None and _tfidf is not None)}

@app.get("/warmup")
def warmup(x_auth: Optional[str] = Header(None)):
    _require_auth(x_auth)
    if _df is None or _tfidf is None:
        raise HTTPException(status_code=503, detail="artifacts_unavailable")
    _ = _tfidf.getrow(0).nnz
    return {"ok": True}

@app.get("/recomendar")
def recomendar(
    prod_id: str = Query(..., alias="prod_id"),
    topk: int = 10,
    x_auth: Optional[str] = Header(None),
):
    _require_auth(x_auth)
    if _df is None or _tfidf is None:
        raise HTTPException(status_code=503, detail="artifacts_unavailable")

    topk = max(1, min(int(topk), 100))

    idx_list = _df.index[_df["product_id"] == prod_id].tolist()
    if not idx_list:
        raise HTTPException(status_code=404, detail=f"produto '{prod_id}' não encontrado")
    i = int(idx_list[0])

    sims = (_tfidf @ _tfidf.getrow(i).T).toarray().ravel()
    k = min(topk + 1, sims.shape[0])
    idx_top = np.argpartition(sims, -k)[-k:]
    idx_top = idx_top[np.argsort(sims[idx_top])[::-1]]
    idx_top = [j for j in idx_top if j != i][:topk]

    cols = ["product_id", "product_name", "rating", "img_link", "actual_price"]
    available = [c for c in cols if c in _df.columns]
    recs = _df.iloc[idx_top][available].to_dict(orient="records")
    return {"data": recs}