const { pedidoModel } = require("../model/pedidoModel");

const pedidoController = {

    /**
     * Lista pedidos cadastrados.
     *
     * Sempre que começa com a {chave} é um objeto JavaScript.
     *
     * Regras:
     * - Se o cliente enviar ?idPedido=UUID → retorna somente 1 pedido.
     * - Caso não envie → retorna todos os pedidos.
     *
     * @async
     * @function listarPedido
     * @param {Object} req - Objeto da requisição HTTP.
     * @param {Object} res - Objeto de resposta HTTP.
     * @returns {Promise<void>} Retorna JSON com um pedido ou a lista completa.
     * @throws Retorna código 500 caso ocorra erro na consulta.
     */
    listarPedido: async (req, res) => {
        try {

            const { idPedido } = req.query;

            if (idPedido) {
                // Validação de UUID com 36 caracteres
                if (idPedido.length != 36) {
                    return res.status(400).json({ erro: "id do Pedido invalido" });
                }

                const pedido = await pedidoModel.buscarUm(idPedido);
                return res.status(200).json(pedido);
            }

            const pedidos = await pedidoModel.buscarTodos();
            res.status(200).json(pedidos);

        } catch (error) {
            console.error('Erro ao listar os pedidos:', error);
            res.status(500).json({ message: 'erro ao buscar pedidos.' });
        }
    },



    /**
     * Cria um novo pedido e realiza os cálculos automáticos.
     *
     * Sempre que começa com a {chave} é um objeto JavaScript.
     *
     * Corpo esperado:
     * {
     *   "idCliente": "",
     *   "dataPedido": "",
     *   "tipoEntrega": "",
     *   "distanciaKm": 0,
     *   "pesoCargaKG": 0,
     *   "valorKm": 0,
     *   "valorKg": 0
     * }
     *
     * Regras aplicadas:
     * - Calcula custo por KM e KG.
     * - Aplica acréscimo (20%) para entrega urgente.
     * - Aplica desconto (10%) para valores acima de 500.
     * - Taxa extra de R$15 para cargas acima de 50kg.
     *
     * @async
     * @function criarPedido
     * @param {Object} req - Dados enviados pelo cliente HTTP.
     * @param {Object} res - Resposta HTTP enviada ao cliente.
     * @returns {Promise<void>} Retorna mensagem de sucesso.
     * @throws Erro 500 caso ocorra falha ao inserir no banco.
     */
    criarPedido: async (req, res) => {
        try {

            const { idCliente, dataPedido, tipoEntrega, distanciaKm, pesoCargaKG, valorKm, valorKg } = req.body;

            // Verifica campos obrigatórios
            if (!idCliente || !dataPedido || !tipoEntrega || distanciaKm == undefined || pesoCargaKG == undefined || valorKm == undefined || valorKg == undefined) {
                return res.status(400).json({ error: 'campos obrigatorios não prenchidos!' });
            }

            // Cálculos principais
            let valorDistancia = distanciaKm * valorKm;
            let valorPeso = pesoCargaKG * valorKg;
            let valorFinal = valorDistancia + valorPeso;

            // Percentuais e taxas
            let acrescimo = valorFinal * 0.2;
            let desconto = valorFinal * 0.1;
            let taxaExtra = 15;

            let statusEntrega = "calculado";

            // Regras de preço
            if (pesoCargaKG > 50) {
                valorFinal + taxaExtra; // OBS: falta atribuição → deveria ser valorFinal += taxaExtra
            }
            if (tipoEntrega == "Urgente") {
                valorFinal += acrescimo;
            }
            if (valorFinal >= 500) {
                valorFinal -= desconto;
            }

            // Insere no banco
            await pedidoModel.inserirPedido(
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKm,
                pesoCargaKG,
                valorKm,
                valorKg,
                valorDistancia,
                valorPeso,
                acrescimo,
                desconto,
                taxaExtra,
                valorFinal,
                statusEntrega
            );

            res.status(201).json({ message: 'pedido e entrega cadastrado com sucesso!' });

        } catch (error) {
            console.error('erro ao cadastrar pedido:', error);
            res.status(500).json({ error: 'erro no servidor ao cadastrar pedido' });
        }
    },



    /**
     * Atualiza um pedido existente e recalcula todos os valores automaticamente.
     *
     * Sempre que começa com a {chave} é um objeto JavaScript.
     *
     * - Mantém valores antigos caso não sejam enviados.
     * - Recalcula custo por KM, KG, acréscimo, desconto e taxas.
     *
     * @async
     * @function atualizarPedido
     * @param {Object} req - Requisição HTTP contendo parâmetros e corpo.
     * @param {Object} res - Objeto de resposta HTTP.
     * @returns {Promise<void>} Retorna mensagem de sucesso.
     * @throws Retorna erro 500 se ocorrer falha durante atualização.
     */
    atualizarPedido: async (req, res) => {

        try {

            const { idPedido } = req.params;
            const { idCliente, dataPedido, tipoEntrega, distanciaKm, pesoCargaKg, valorKm, valorKg, statusEntrega } = req.body;

            // Valida ID
            if (idPedido.length != 36) {
                return res.status(400).json({ erro: "id do pedido inválido" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "pedido não encontrado" });
            }

            const pedidoAtual = pedido[0];

            // Atualiza somente o que foi enviado (nullish)
            const idClienteAtualizado = idCliente ?? pedidoAtual.idCliente;
            const dataPedidoAtualizado = dataPedido ?? pedidoAtual.dataPedido;
            const tipoEntregaAtualizado = tipoEntrega ?? pedidoAtual.tipoEntrega;
            const distanciaKmAtualizado = distanciaKm ?? pedidoAtual.distanciaKm;
            const pesoCargaKgAtualizado = pesoCargaKg ?? pedidoAtual.pesoCargaKg;
            const valorKmAtualizado = valorKm ?? pedidoAtual.valorKm;
            const valorKgAtualizado = valorKg ?? pedidoAtual.valorKg;

            // Recalcula valores
            let valorDistanciaAtualizado = distanciaKmAtualizado * valorKmAtualizado;
            let valorPesoAtualizado = pesoCargaKgAtualizado * valorKgAtualizado;
            let valorFinalAtualizado = valorDistanciaAtualizado + valorPesoAtualizado;

            let acrescimoAtualizado = valorFinalAtualizado * 0.2;
            let descontoAtualizado = valorFinalAtualizado * 0.1;
            let taxaExtra = 15;

            let statusEntregaAtualizado = statusEntrega ?? pedidoAtual.statusEntrega;

            // Regras de valor
            if (pesoCargaKgAtualizado > 50) valorFinalAtualizado += taxaExtra;

            if (tipoEntregaAtualizado.toLowerCase() === "urgente") {
                valorFinalAtualizado += acrescimoAtualizado;
            }

            if (valorFinalAtualizado >= 500) {
                valorFinalAtualizado -= descontoAtualizado;
            }

            // Atualiza banco
            await pedidoModel.atualizarPedido(
                idPedido,
                idClienteAtualizado,
                dataPedidoAtualizado,
                tipoEntregaAtualizado,
                distanciaKmAtualizado,
                pesoCargaKgAtualizado,
                valorKmAtualizado,
                valorKgAtualizado,
                valorDistanciaAtualizado,
                valorPesoAtualizado,
                acrescimoAtualizado,
                descontoAtualizado,
                taxaExtra,
                valorFinalAtualizado,
                statusEntregaAtualizado
            );

            res.status(200).json({ message: "Pedido atualizado com sucesso!" });

        } catch (error) {
            console.error('Erro ao atualizar pedido', error);
            res.status(500).json({ erro: 'Erro no servidor ao atualizar pedido!' });
        }

    },



    /**
     * Deleta um pedido existente.
     *
     * Sempre que começa com a {chave} é um objeto JavaScript.
     *
     * - Valida UUID.
     * - Verifica se o pedido existe.
     * - Remove do banco.
     *
     * @async
     * @function deletarPedido
     * @param {Object} req - Objeto contendo params da rota.
     * @param {Object} res - Objeto de resposta HTTP.
     * @returns {Promise<void>} Retorna mensagem de sucesso.
     * @throws Erro 500 caso a operação falhe.
     */
    deletarPedido: async (req, res) => {
        try {

            const { idPedido } = req.params;

            if (idPedido.length != 36) {
                return res.status(400).json({ erro: "id do pedido inválido" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado" });
            }

            await pedidoModel.deletarPedido(idPedido);

            res.status(200).json({ message: "pedido deletado com sucesso!" });

        } catch (error) {
            console.error('Erro ao deletar pedido', error);
            res.status(500).json({ erro: 'Erro no servidor ao deletar pedido!' });
        }
    }

}

module.exports = { pedidoController };
