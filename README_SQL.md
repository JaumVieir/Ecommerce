# Ecommerce 2/2

<p align="justify" >
    <strong> 
      Nessa documentação está descrito os EndPoints de Cadastro e Login do Usuário e Compra e Consulta de Vendas
    </strong>
</p>

---

### Backend - SQL

### USUÁRIO

#### POST-> http:localhost:3000/usuariosEcommerce/cadastro
#### Entrada:
    {
    "nome":"Iago Duarte Gostoso",
    "cpf":"100.200.200-20",
    "email":"iaguinho@gmail.com",
    "senha":"sougay"
    }
#### Saida:
    {
    "msg": "Inserido!"
    }
#### - Esse EndPoint retorna 1 atributos: CONFIRMANDO QUE O USUÁRIO FOI INSERIDO NO BD.


#### POST-> http:localhost:3000/usuariosEcommerce/login
#### Entrada:
    {
    "email":"joao@gmail.com",
    "senha":"capitao"
    }
#### Saida:
    {
    "id": 1,
    "nome": "João Vitor",
    "cpf": "400.000.000-45",
    "email": "joao@gmail.com",
    "senha": "capitao"
    }
#### Esse EndPoint retorna 1 atributos: OBJETO COM OS DADOS DO USUÁRIO CASO ELE ESTEJA CADASTRADO.

### VENDA

#### POST-> http:localhost:3000/vendas
#### Entrada:
    {
    "idUsuario": "01",
    "precoTotal": 2500,
    "produtos":[
        {"product_id":"B08TZTSCJ5", "qtd": 3, "preco":1500},
        {"product_id":"B079Y1YPTK", "qtd": 4, "preco": 1000} ]
    }
#### Saida:
    {
    "message": "Venda registrada com sucesso",
    "idVenda": 21
    }
#### - Esse EndPoint retorna 1 objeto com 2 atributos: CONFIRMANDO QUE A VENDA FOI REGISTRADA.


#### GET-> http:localhost:3000/vendas/getVendasById/1
#### Entrada:
    {
    "idUsuario": "01"
    }
#### Saida:
    
    [{
        "id": 20,
        "dataVenda": "2025-10-04 10:09:36",
        "valorTotal": 2500,
        "produtos": [
            {
                "category": "Jardim e Piscina",
                "decricao": "Minelab Detector de metais Equinox 800 com bobina impermeável de Double-D: facilita sua rotina com uso intuitivo e manutenção simples. Construção resistente para encarar o uso contínuo com tranquilidade.",
                "img_link": "https://m.media-amazon.com/images/I/71jLLUdujkL._AC_UL320_.jpg",
                "product_id": "B079Y1YPTK",
                "actual_price": 6199,
                "product_name": "Minelab Detector de metais Equinox 800 com bobina impermeável EQX de 28 cm Double-D"
            },
            {
                "category": "Jardim e Piscina",
                "decricao": "Bomba De Calor Nautilus Terma Max 3 50.001 Btu Terma Nautilus: facilita sua rotina com uso intuitivo e manutenção simples. Conexão sem fio estável, com pareamento rápido e controles fáceis de usar.",
                "img_link": "https://m.media-amazon.com/images/I/51Mu3CTSoBL._AC_UL320_.jpg",
                "product_id": "B08TZTSCJ5",
                "actual_price": 14999.99,
                "product_name": "Bomba De Calor Nautilus Terma Max 3 50.001 Btu Terma Nautilus"
            }
        ]
    },
    {
        "id": 19,
        "dataVenda": "2025-10-03 23:47:21",
        "valorTotal": 2500,
        "produtos": [
            {
                "category": "Jardim e Piscina",
                "decricao": "Minelab Detector de metais Equinox 800 com bobina impermeável de Double-D: facilita sua rotina com uso intuitivo e manutenção simples. Construção resistente para encarar o uso contínuo com tranquilidade.",
                "img_link": "https://m.media-amazon.com/images/I/71jLLUdujkL._AC_UL320_.jpg",
                "product_id": "B079Y1YPTK",
                "actual_price": 6199,
                "product_name": "Minelab Detector de metais Equinox 800 com bobina impermeável EQX de 28 cm Double-D"
            },
            {
                "category": "Jardim e Piscina",
                "decricao": "Bomba De Calor Nautilus Terma Max 3 50.001 Btu Terma Nautilus: facilita sua rotina com uso intuitivo e manutenção simples. Conexão sem fio estável, com pareamento rápido e controles fáceis de usar.",
                "img_link": "https://m.media-amazon.com/images/I/51Mu3CTSoBL._AC_UL320_.jpg",
                "product_id": "B08TZTSCJ5",
                "actual_price": 14999.99,
                "product_name": "Bomba De Calor Nautilus Terma Max 3 50.001 Btu Terma Nautilus"
            }
        ]
    }]
  
  
#### - Esse EndPoint retorna um vetor de objetos, com 4 atributos como id da venda, dataVenda, valorTotal e produtos(Que é um vetor que contém todos os produtos da venda). 

