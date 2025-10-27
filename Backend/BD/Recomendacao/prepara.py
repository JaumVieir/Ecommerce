import os, pickle, pandas as pd, unicodedata, re, nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download("stopwords", quiet=True)
STOP_WORDS = set(stopwords.words("portuguese"))

def limpa_texto(texto):
    texto = texto.lower()
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("utf-8")
    texto = re.sub(r"[^a-zA-Z0-9\s]", "", texto)
    return " ".join([w for w in texto.split() if w not in STOP_WORDS])

DATA_DIR   = os.environ.get("DATA_DIR", "./data")         # aponte para disco persistente
INPUT_CSV  = os.environ.get("INPUT_CSV", "./data/produtos.csv")
os.makedirs(DATA_DIR, exist_ok=True)

df = pd.read_csv(INPUT_CSV).dropna()
df["product_name"] = df["product_name"].apply(limpa_texto)
df["category"]     = df["category"].apply(limpa_texto)
df["actual_price"] = (df["actual_price"]
                      .astype(str).str.replace("₹","").str.replace(",","").astype(float))
df["rating"]       = pd.to_numeric(df["rating"].astype(str).str.replace("|",""), errors="coerce")
df["rating_count"] = df["rating_count"].astype(str).str.replace(",","").astype(int)
df["combined_text"]= (df["product_name"] + " " + df["category"]).fillna("") + " " + df["descrição"]

vectorizer   = TfidfVectorizer(stop_words=list(STOP_WORDS), max_df=0.95, min_df=2, ngram_range=(1,1))
tfidf_matrix = vectorizer.fit_transform(df["combined_text"])
cosine_sim   = cosine_similarity(tfidf_matrix)

with open(f"{DATA_DIR}/vectorizer.pkl", "wb") as f: pickle.dump(vectorizer, f)
with open(f"{DATA_DIR}/tfidf_matrix.pkl", "wb") as f: pickle.dump(tfidf_matrix, f)
with open(f"{DATA_DIR}/cosine_sim_matrix.pkl","wb") as f: pickle.dump(cosine_sim, f)
with open(f"{DATA_DIR}/produtos_df.pkl", "wb") as f: pickle.dump(df, f)
print("OK: artefatos gerados em", DATA_DIR)