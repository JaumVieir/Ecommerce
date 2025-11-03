# convert_to_sparse_npz.py
import pickle, pandas as pd
from scipy.sparse import save_npz, csr_matrix
import numpy as np

# 1) df
with open("produtos_df.pkl", "rb") as f:
    df = pickle.load(f)
# opcional: salvar em parquet (mais leve/rápido)
df.to_parquet("produtos_df.parquet", index=False)

# 2) tfidf_matrix.pkl -> .npz esparso e em float32
with open("tfidf_matrix.pkl", "rb") as f:
    tfidf = pickle.load(f)         # deve ser scipy.sparse
if not hasattr(tfidf, "tocsr"):
    tfidf = csr_matrix(tfidf)
tfidf = tfidf.astype(np.float32)   # reduz RAM e arquivo
save_npz("tfidf_matrix.npz", tfidf)

# (opcional) vectorizer.pkl só se você precisar transformar texto em runtime
# cosine_sim_matrix.pkl -> NÃO vamos mais usar
print("OK: salvos produtos_df.parquet e tfidf_matrix.npz")