## api reference 

### MODELO ENTIDADE RELACIONAMENTO
![MODELO ENTIDADE RELACIONAMENTO](./Rápido%20&%20seguro%20logística.drawio.png)

### clientes 

#### GET/clientes
-**Descriçao**: obtém uma lista de clientes
-**Responde**: Array de clientes

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

#### PUT/clientes/:idCliente
-**Descriçao**: atualiza um cliente
-**Responde**:
```
{
    "message": "cliente atualizado com sucesso"
}
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