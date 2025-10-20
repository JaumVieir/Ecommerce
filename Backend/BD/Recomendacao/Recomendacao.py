import pickle
import json
import sys
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

with open("C:/Users/User/Desktop/Ecommerce/Backend/BD/Recomendacao/produtos_df.pkl", "rb") as f:
    df = pickle.load(f)

with open("C:/Users/User/Desktop/Ecommerce/Backend/BD/Recomendacao/cosine_sim_matrix.pkl", "rb") as f:
    cosine_sim = pickle.load(f)

def recomendacao(produto_id, top_n=10):
    idx_lista = df.index[df["product_id"] == produto_id].tolist()
    if not idx_lista:
        return {"ok": False, "error": f"Produto com ID {produto_id} não encontrado."}

    idx = idx_lista[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    recomendados_idx = [i[0] for i in sim_scores[1:top_n+1]]

    recomendados = df.iloc[recomendados_idx][["product_id", "product_name", "rating", "img_link", "actual_price"]]
    return {"ok": True, "data": recomendados.to_dict(orient="records")}

def main():
    try:
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        produto_id = data.get("id")

        if not produto_id:
            print(json.dumps({"ok": False, "error": "ID não fornecido."}))
            return

        resultado = recomendacao(produto_id)
        print(json.dumps(resultado, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}))

if __name__ == "__main__":
    main()
        