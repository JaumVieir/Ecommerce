# python-svc/app.py
import os, pickle
from fastapi import FastAPI, Header, HTTPException, Query

APP_TOKEN = os.getenv("PY_SVC_TOKEN", "demo-secret")
ART_DIR = os.getenv("ART_DIR", "/data")  # no Render será /data (Disk); local pode ser ./artifacts

app = FastAPI()

def _require_auth(x_auth: str | None):
    if x_auth != APP_TOKEN:
        raise HTTPException(status_code=401, detail="unauthorized")

def _artefatos_ok():
    return all(os.path.exists(os.path.join(ART_DIR, f)) for f in [
        "produtos_df.pkl", "cosine_sim_matrix.pkl"
    ])

df = None
cosine_sim = None

@app.on_event("startup")
def load_artifacts():
    global df, cosine_sim
    if _artefatos_ok():
        with open(os.path.join(ART_DIR, "produtos_df.pkl"), "rb") as f:
            df = pickle.load(f)
        with open(os.path.join(ART_DIR, "cosine_sim_matrix.pkl"), "rb") as f:
            cosine_sim = pickle.load(f)

@app.get("/healthz")
def healthz():
    return {"ok": True, "artifacts": bool(df is not None and cosine_sim is not None)}

@app.get("/recomendar")
def recomendar(
    prod_id: str = Query(..., alias="prod_id"),
    topk: int = 10,
    x_auth: str | None = Header(None),
):
    _require_auth(x_auth)
    if df is None or cosine_sim is None:
        raise HTTPException(503, "artifacts_unavailable")
    # ajuste a coluna de ID conforme seu DF:
    idx_list = df.index[df["product_id"] == prod_id].tolist()
    if not idx_list:
        raise HTTPException(404, "produto não encontrado")
    i = int(idx_list[0])
    sims = cosine_sim[i]
    similar_idx = sims.argsort()[-(topk+1):][::-1]
    similar_idx = [j for j in similar_idx if j != i][:topk]
    cols = ["product_id", "product_name", "rating", "img_link", "actual_price"]
    recs = df.iloc[similar_idx][cols].to_dict(orient="records")
    return {"data": recs}
