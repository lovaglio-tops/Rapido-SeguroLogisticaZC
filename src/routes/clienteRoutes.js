/**
 * Rotas referentes aos clientes.
 * 
 * Utiliza o Express Router para organizar os endpoints de CRUD
 * relacionados ao cliente. Cada rota chama uma função do
 * clienteController responsável por processar a requisição.
 * 
 * Sempre que começa com {chave} é um objeto JavaScript.
 */

const express = require("express");
const router = express.Router();
const { clienteController } = require("../controllers/clienteController");

/**
 * Rota GET /clientes
 * Lista todos os clientes cadastrados.
 * 
 * @route GET /clientes
 * @returns {JSON} Retorna lista de clientes.
 */
router.get("/clientes", clienteController.listarCliente);

/**
 * Rota POST /clientes
 * Cria um novo cliente no banco de dados.
 * 
 * @route POST /clientes
 * @body {Object} Dados do cliente enviados na requisição.
 * @returns {JSON} Retorna o cliente criado.
 */
router.post("/clientes", clienteController.criarCliente);

/**
 * Rota PUT /clientes/:idCliente
 * Atualiza um cliente existente pelo seu ID.
 * 
 * @route PUT /clientes/:idCliente
 * @param {string} idCliente - ID do cliente enviado na URL.
 * @returns {JSON} Retorna o cliente atualizado.
 */
router.put("/clientes/:idCliente", clienteController.atualizarCliente);

/**
 * Rota DELETE /clientes/:idCliente
 * Deleta um cliente do banco pelo ID informado.
 * 
 * @route DELETE /clientes/:idCliente
 * @param {string} idCliente - ID do cliente enviado na URL.
 * @returns {JSON} Mensagem de sucesso da operação.
 */
router.delete("/clientes/:idCliente", clienteController.deletarCliente);

module.exports = { clienteRoutes: router };
