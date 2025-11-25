const { pedidoModel } = require("../model/pedidoModel");

const pedidoController = {

    // ------------------------------------------------------
    // Listar pedidos
    // GET /pedidos
    // Se enviado ?idPedido=UUID → retorna apenas 1 pedido
    // Caso contrário → retorna todos os pedidos
    // ------------------------------------------------------
    listarPedido: async (req, res) => {
        try {

            const { idPedido } = req.query;

            // Caso o usuário envie um ID específico
            if (idPedido) {
                // Valida formato do ID (UUID com 36 caracteres)
                if (idPedido.length != 36) {
                    return res.status(400).json({ erro: "id do Pedido invalido" });
                }

                // Retorna somente um pedido
                const pedido = await pedidoModel.buscarUm(idPedido);
                return res.status(200).json(pedido);
            }

            // Caso não envie ID, retorna todos
            const pedidos = await pedidoModel.buscarTodos();
            res.status(200).json(pedidos);

        } catch (error) {
            console.error('Erro ao listar os pedidos:', error);
            res.status(500).json({ message: 'erro ao buscar pedidos.' });
        }
    },



    // ------------------------------------------------------
    // Criar novo pedido
    // POST /pedidos
    // Corpo esperado:
    /*
    {
        "idCliente": "",
        "dataPedido": "",
        "tipoEntrega": "",
        "distanciaKm": 0,
        "pesoCargaKG": 0,
        "valorKm": 0,
        "valorKg": 0
    }
    */
    // Calcula valores (distância, peso, acréscimo, desconto, taxa extra)
    // e salva o pedido no banco
    // ------------------------------------------------------
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
                valorFinal + taxaExtra; // OBS: aqui está faltando atribuição, deveria ser "valorFinal += taxaExtra"
            }
            if (tipoEntrega == "Urgente") {
                valorFinal = valorFinal + acrescimo;
            }
            if (valorFinal >= 500) {
                valorFinal = valorFinal - desconto;
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



    // ------------------------------------------------------
    // Atualizar um pedido existente
    // PUT /pedidos/:idPedido
    // Recalcula automaticamente todos os valores
    // Mantém valores antigos caso não sejam enviados
    // ------------------------------------------------------
    atualizarPedido: async (req, res) => {

        try {

            const { idPedido } = req.params;
            const { idCliente, dataPedido, tipoEntrega, distanciaKm, pesoCargaKg, valorKm, valorKg, valorDistancia, valorPeso, valorFinal, acrescimo, desconto, statusEntrega } = req.body;

            // Valida formato do ID
            if (idPedido.length != 36) {
                return res.status(400).json({ erro: "id do pedido inválido" });
            }

            // Verifica se o pedido existe
            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "pedido não encontrado" });
            }

            // Dados atuais do pedido
            const pedidoAtual = pedido[0];

            // Mantém os valores antigos caso não sejam enviados
            const idClienteAtualizado = idCliente ?? pedidoAtual.idCliente;
            const dataPedidoAtualizado = dataPedido ?? pedidoAtual.dataPedido;
            const tipoEntregaAtualizado = tipoEntrega ?? pedidoAtual.tipoEntrega;
            const distanciaKmAtualizado = distanciaKm ?? pedidoAtual.distanciaKm;
            const pesoCargaKgAtualizado = pesoCargaKg ?? pedidoAtual.pesoCargaKg;
            const valorKmAtualizado = valorKm ?? pedidoAtual.valorKm;
            const valorKgAtualizado = valorKg ?? pedidoAtual.valorKg;

            // Recalcula valores com base nos novos dados
            let valorDistanciaAtualizado = distanciaKmAtualizado * valorKmAtualizado;
            let valorPesoAtualizado = pesoCargaKgAtualizado * valorKgAtualizado;
            let valorFinalAtualizado = valorDistanciaAtualizado + valorPesoAtualizado;
            let acrescimoAtualizado = valorFinalAtualizado * 0.2;
            let descontoAtualizado = valorFinalAtualizado * 0.1;

            let taxaExtra = 15;

            let statusEntregaAtualizado = statusEntrega ?? pedidoAtual.statusEntrega;

            // Regras de preço
            if (pesoCargaKgAtualizado > 50) {
                valorFinalAtualizado = valorFinalAtualizado + taxaExtra;
            }

            if (tipoEntregaAtualizado === "Urgente" || tipoEntregaAtualizado === "urgente") {
                valorFinalAtualizado = valorFinalAtualizado + acrescimoAtualizado;
            }

            if (valorFinalAtualizado >= 500) {
                valorFinalAtualizado = valorFinalAtualizado - descontoAtualizado;
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



    // ------------------------------------------------------
    // Deletar um pedido
    // DELETE /pedidos/:idPedido
    // Valida ID e verifica se o pedido existe antes de deletar
    // ------------------------------------------------------
    deletarPedido: async (req, res) => {
        try {

            const { idPedido } = req.params;

            // Valida ID
            if (idPedido.length != 36) {
                return res.status(400).json({ erro: "id do pedido inválido" });
            }

            // Verifica existência
            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado" });
            }

            // Remove
            await pedidoModel.deletarPedido(idPedido);

            res.status(200).json({ message: "pedido deletado com sucesso!" });

        } catch (error) {
            console.error('Erro ao deletar pedido', error);
            res.status(500).json({ erro: 'Erro no servidor ao deletar pedido!' });
        }
    }

}

module.exports = { pedidoController };
