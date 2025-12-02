## api reference 

### MODELO ENTIDADE RELACIONAMENTO
![MODELO ENTIDADE RELACIONAMENTO](./Rápido%20&%20seguro%20logística.drawio%20(1).png)

### clientes 

#### GET/clientes
- **Descriçao**: obtém uma lista de clientes
- **Responde**: Array de clientes

#### POST /clientes
-**Descrição**: Cria um novo cliente
-**Body**:
```
{
    "nomeCliente": "clienteExemplo"
    "cpfCliente": "51891519808"
    "telefone": "19998706798"
    "email": "exemplo@gmail.com"
    "endereco": "Avenida Central, 987, Centro, Belo Horizonte, MG, 30120-045"

}
```
-**Response**:
```
{
    "message": "cliente cadastrado com sucesso"
}
```

```
{
    "erro": "id do Cliente invalido"
} 
```

#### PUT/clientes/:idCliente
-**Descriçao**: atualiza um cliente
-**Responde**:
```
{
    "nomeCliente": "clienteExemplo",
    "cpfCliente": "51891519808",
    "telefone": "19998706798",
    "email": "exemplo@gmail.com",
    "endereco": "Avenida Central, 987, Centro, Belo Horizonte, MG, 30120-045"
}
```
```
{
    "message": "cliente atualizado com sucesso"
}
``` 
```
{ "erro": "id do cliente inválido" }

```
```
{ "erro": "CPF ou email já cadastrado" }
```

#### DELETE/clientes/:idCliente
-**Descriçao**: deleta um cliente
-**Responde**:
```
{
    "message": "cliente deletado com sucesso"
}
``` 

### pedidos 

#### GET/pedidos
-**Descriçao**: obtém uma lista de pedidos
-**Responde**: Array de pedidos

#### POST /pedidos
-**Descrição**: Cria um novo pedido
-**Body**:
```

{
	"idCliente":"E991F2A5-17D9-42F1-97FE-CD695AFBA831", 
	"dataPedido": "2025-11-11",
	"tipoEntrega": "urgente",
	"distanciaKm": 250.00,
	"pesoCargaKG": 12.00,
	"valorKm": 5.50,
	"valorKg": 4.00
}


```
-**Response**:
```
{
    "message": "pedido cadastrado com sucesso"
}
```

#### PUT/pedidos/:idPedido
-**Descriçao**: atualiza um pedido
-**Responde**:
```
{
    "message": "pedido atualizado com sucesso"
}
``` 

#### DELETE/pedidos/:idPedido
-**Descriçao**: deleta um pedido
-**Responde**:
```
{
    "message": "pedido deletado com sucesso"
}
``` 

### entregas 

#### GET/pedidos
-**Descriçao**: obtém uma lista de entregas
-**Responde**: Array de entregas
```
[
  {
    "idPedido": "UUID",
    "idCliente": "UUID",
    "nomeCliente": "João Silva",
    "dataPedido": "2025-11-11",
    "tipoEntrega": "urgente",
    "distanciaKm": 250,
    "pesoCargaKg": 12,
    "valorKm": 5.5,
    "valorKg": 4,
    "valorDistancia": 1375,
    "valorPeso": 48,
    "acrescimo": 284.6,
    "desconto": 142.3,
    "taxaExtra": 15,
    "valorFinal": 1580.3,
    "statusEntrega": "calculado"
  }
]

```

#### POST /pedidos
-**Descrição**: Cria uma nova entrega
-**Body**:
```

{
	"idCliente":"E991F2A5-17D9-42F1-97FE-CD695AFBA831", 
	"dataPedido": "2025-11-11",
	"tipoEntrega": "urgente",
	"distanciaKm": 250.00,
	"pesoCargaKG": 12.00,
	"valorKm": 5.50,
	"valorKg": 4.00
}


```

```
{ "message": "pedido e entrega cadastrado com sucesso" }
```
-**Response**:
```
{
    "message": "entrega cadastrada com sucesso"
}
```

#### PUT/pedidos/:idPedido
-**Descriçao**: atualiza uma entrega
-**Responde**:

```
{
	"dataPedido": "2025-11-11",
	"tipoEntrega": "urgente",
	"distanciaKm": 250.00,
	"pesoCargaKG": 12.00,
	"valorKm": 5.50,
	"valorKg": 4.00
}
```
```
{
    "message": "entrega atualizada com sucesso"
}
``` 

#### DELETE/pedidos/:idPedido
-**Descriçao**: deleta uma entrega
-**Responde**:
```
{
    "message": "entrega deletada com sucesso"
}
``` 