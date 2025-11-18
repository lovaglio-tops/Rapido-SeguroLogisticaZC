const express = require("express");
const router = express.Router();
const { pedidoController } = require("../controllers/pedidoController");

//get /produtos -> lista todos os produtos 
router.get("/pedidos", pedidoController.listarPedido);
router.post("/pedidos", pedidoController.criarPedido);
router.put("/pedidos/:idPedido", pedidoController.atualizarPedido);
router.delete("/pedidos/:idPedido", pedidoController.deletarPedido);

module.exports = { pedidoRoutes: router };