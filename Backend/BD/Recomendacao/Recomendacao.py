import pandas as pd
import nltk
nltk.download('wordnet')
nltk.download('stopwords')
from nltk.corpus import stopwords
import re
import sys, json
STOP_WORDS = set(stopwords.words('portuguese'))

#Feature Engineering
from sklearn.feature_extraction.text import TfidfVectorizer

#Model
from sklearn.metrics.pairwise import cosine_similarity

def limpa_texto(texto):
    texto = texto.lower()
    texto = re.sub(r'[^a-zA-Z0-9\s]','',texto)

    texto = ' '.join([word for word in texto.split() if word not in STOP_WORDS])
    return texto

def recomendacao_conte_val(payload: dict, top_n=10) -> dict:
    produto_id = payload.get("id")
    if produto_id is None:
        return json.dumps({"ok": False, "error": "ID vazio"}, ensure_ascii=False)

    df = pd.read_csv("C:/Users/User/Desktop/ecommerce/Ecommerce/Backend/BD/Recomendacao/produtos3.csv")
    df = df.dropna()

    df["product_name"] = df["product_name"].apply(limpa_texto)
    df["category"]     = df["category"].apply(limpa_texto)

    df["actual_price"] = df["actual_price"].astype(str).str.replace("₹", "").str.replace(",", "").astype(float)
    df["rating"]       = pd.to_numeric(df["rating"].astype(str).str.replace("|", ""), errors="coerce")
    df["rating_count"] = df["rating_count"].astype(str).str.replace(",", "").astype(int)

    df["combined_text"] = (df["product_name"] + " " + df["category"]).fillna("") + " " + df["descrição"]


    vectorizer   = TfidfVectorizer(stop_words=list(STOP_WORDS), max_df=0.95, min_df=2, ngram_range=(1, 1))
    tfidf_matrix = vectorizer.fit_transform(df["combined_text"])
    consine_sim  = cosine_similarity(tfidf_matrix)  # mantendo seu nome da variável


    matrix_prod_usuario = df.pivot_table(index="product_id", values="rating", aggfunc="mean")
    matrix_prod_usuario = matrix_prod_usuario.fillna(matrix_prod_usuario.mean())

    idx_lista = df.index[df["product_id"] == produto_id].tolist()
    if not idx_lista:
        return json.dumps({"ok": False, "error": f"product_id '{produto_id}' não encontrado"}, ensure_ascii=False)
    idx = idx_lista[0]

    sim_scores = list(enumerate(consine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    recomendacao_conteudo_idx = [i[0] for i in sim_scores[1:top_n+1]]

    avaliacoes_similares = matrix_prod_usuario.iloc[0:0]  
    if produto_id in matrix_prod_usuario.index:
        X   = matrix_prod_usuario[["rating"]].fillna(0.0).values  
        sim = cosine_similarity(X)
        pos = matrix_prod_usuario.index.get_loc(produto_id)
        ordem = sim[pos].argsort()[::-1]
        ordem = [i for i in ordem if i != pos][:top_n]  
        avaliacoes_similares = matrix_prod_usuario.iloc[ordem]

    idx_avaliacoes_similares = avaliacoes_similares.index
    idx_avaliacoes_similares = [
        df.index[df["product_id"] == pid].tolist()[0]
        for pid in idx_avaliacoes_similares
        if not df.index[df["product_id"] == pid].empty
    ]

  
    combina = list(set(recomendacao_conteudo_idx + idx_avaliacoes_similares))
    produtos_recomendados = df.iloc[map(int, recomendacao_conteudo_idx)].copy() # Somente baseado em conjunto

    produtos_recomendados = produtos_recomendados[["product_id", "product_name", "rating", "img_link","actual_price"]]

    return json.dumps({"ok": True, "data": produtos_recomendados[:10].to_dict(orient="records")}, ensure_ascii=False)



def main():
    try:
        data = sys.stdin.read()
        predicao = json.loads(data) if data else {}
        print(json.dumps(recomendacao_conte_val(predicao), ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))

if __name__ == "__main__":
    main()
