# preprocessa_dados.py
import pandas as pd
import pickle
import unicodedata
import re
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOP_WORDS = set(stopwords.words('portuguese'))

def limpa_texto(texto):
    texto = texto.lower()
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("utf-8")
    texto = re.sub(r'[^a-zA-Z0-9\s]', '', texto)
    texto = ' '.join([word for word in texto.split() if word not in STOP_WORDS])
    return texto

df = pd.read_csv("C:/Users/Bitlab/Desktop/Ecommerce/Backend/BD/Recomendacao/produtos3.1.csv").dropna()
df["product_name"] = df["product_name"].apply(limpa_texto)
df["category"] = df["category"].apply(limpa_texto)
df["actual_price"] = df["actual_price"].astype(str).str.replace("₹", "").str.replace(",", "").astype(float)
df["rating"] = pd.to_numeric(df["rating"].astype(str).str.replace("|", ""), errors="coerce")
df["rating_count"] = df["rating_count"].astype(str).str.replace(",", "").astype(int)

df["combined_text"] = (df["product_name"] + " " + df["category"]).fillna("") + " " + df["descrição"]

vectorizer = TfidfVectorizer(stop_words=list(STOP_WORDS), max_df=0.95, min_df=2, ngram_range=(1, 1))
tfidf_matrix = vectorizer.fit_transform(df["combined_text"])
cosine_sim_matrix = cosine_similarity(tfidf_matrix)

print("Salvando arquivos...")

with open("C:/Users/Bitlab/Desktop/Ecommerce/Backend/BD/Recomendacao/vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

with open("C:/Users/Bitlab/Desktop/Ecommerce/Backend/BD/Recomendacao/tfidf_matrix.pkl", "wb") as f:
    pickle.dump(tfidf_matrix, f)

with open("C:/Users/Bitlab/Desktop/Ecommerce/Backend/BD/Recomendacao/cosine_sim_matrix.pkl", "wb") as f:
    pickle.dump(cosine_sim_matrix, f)

with open("C:/Users/Bitlab/Desktop/Ecommerce/Backend/BD/Recomendacao/produtos_df.pkl", "wb") as f:
    pickle.dump(df, f)

print("Pré-processamento finalizado!")
