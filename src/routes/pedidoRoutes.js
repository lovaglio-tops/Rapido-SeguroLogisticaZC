/**
 * Rotas referentes aos pedidos.
 * 
 * Utiliza o Express Router para organizar os endpoints de CRUD
 * relacionados ao pedido. Cada rota chama uma função do
 * pedidoController responsável por processar a requisição.
 * 
 * Sempre que começa com {chave} é um objeto JavaScript.
 */

const express = require("express");
const router = express.Router();
const { pedidoController } = require("../controllers/pedidoController");

/**
 * Rota GET /pedidos
 * Lista todos os pedidos cadastrados.
 * 
 * @route GET /pedidos
 * @query {string} [idPedido] - (Opcional) ID do pedido para buscar apenas um.
 * @returns {JSON} Retorna lista de pedidos ou um pedido específico.
 */
router.get("/pedidos", pedidoController.listarPedido);

/**
 * Rota POST /pedidos
 * Cria um novo pedido no banco de dados.
 * 
 * @route POST /pedidos
 * @body {Object} Dados do pedido enviados na requisição.
 * @returns {JSON} Retorna mensagem de sucesso com o pedido criado.
 */
router.post("/pedidos", pedidoController.criarPedido);

/**
 * Rota PUT /pedidos/:idPedido
 * Atualiza um pedido existente pelo seu ID.
 * 
 * @route PUT /pedidos/:idPedido
 * @param {string} idPedido - ID do pedido enviado na URL.
 * @body {Object} Dados atualizados do pedido.
 * @returns {JSON} Retorna mensagem de sucesso após atualizar.
 */
router.put("/pedidos/:idPedido", pedidoController.atualizarPedido);

/**
 * Rota DELETE /pedidos/:idPedido
 * Deleta um pedido do banco pelo ID informado.
 * 
 * @route DELETE /pedidos/:idPedido
 * @param {string} idPedido - ID do pedido enviado na URL.
 * @returns {JSON} Mensagem de sucesso da operação.
 */
router.delete("/pedidos/:idPedido", pedidoController.deletarPedido);

module.exports = { pedidoRoutes: router };
