const { pedidoModel } = require("../model/pedidoModel");

const pedidoController = {


    listarPedido: async (req, res) => {
        try {

            const { idPedido } = req.query;

            if (idPedido) {
                if (idPedido.length != 36) {
                    return res.status(400).json({ erro: "id do Pedido invalido" })

                }
                const pedido = await pedidoModel.buscarUm(idPedido);
                return res.status(200).json(pedido)
            }

            const pedidos = await pedidoModel.buscarTodos();


            res.status(200).json(pedidos);

        } catch (error) {
            console.error('Erro ao listar os pedidos:', error);

            res.status(500).json({ message: 'erro ao buscar pedidos.' })

        }
    },

    criarPedido: async (req, res) => {
        try {

            const { idCliente, dataPedido, tipoEntrega, distanciaKm, pesoCargaKG, valorKm, valorKg } = req.body;


            if (idCliente == undefined || dataPedido == undefined || tipoEntrega == undefined || distanciaKm == undefined || pesoCargaKG == undefined || valorKm == undefined || valorKg == undefined) {
                return res.status(400).json({ error: 'campos obrigatorios não prenchidos!' });
            }

            let valorDistancia = distanciaKm * valorKm;

            let valorPeso = pesoCargaKG * valorKg;

            let valorFinal = valorDistancia + valorPeso;

            let acrescimo = valorFinal * 0.2;

            let desconto = valorFinal * 0.1;

            let taxaExtra = 15;

            let statusEntrega = "calculado";





            if (pesoCargaKG > 50) {
                valorFinal + taxaExtra
            }
            if (tipoEntrega == "Urgente") {
                valorFinal = valorFinal + acrescimo
            }
            if (valorFinal >= 500) {
                valorFinal = valorFinal - desconto
            }




            // const datePedido = {
            //     idCliente,
            //     dataPedido,
            //     tipoEntrega,
            //     distanciaKm,
            //     pesoCargaKG,
            //     valorKm,
            //     valorKg
            // }

            // const dateEntrega = {
            //     valorDistancia,
            //     valorPeso,
            //     acrescimo,
            //     desconto,
            //     taxaExtra,
            //     valorFinal,
            //     statusEntrega
            // }

            // console.log(datePedido);
            // console.log(dateEntrega);

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


    atualizarPedido: async (req, res) => {

        try {

            const { idPedido } = req.params;
            const { idCliente, dataPedido, tipoEntrega, distanciaKm, pesoCargaKg, valorKm, valorKg, valorDistancia, valorPeso, valorFinal, acrescimo, desconto, statusEntrega } = req.body;
            //console.log(idCliente, dataPedido, tipoEntrega, distanciaKm, pesoCargaKg, valorKm, valorKg);
            
            if (idPedido.length != 36) {
                return res.status(400), json({ erro: "id do pedido inválido" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "pedido não encontrado" });
            }

            const pedidoAtual = pedido[0];

            const idClienteAtualizado = idCliente ?? pedidoAtual.idCliente;
            const dataPedidoAtualizado = dataPedido ?? pedidoAtual.dataPedido;
            const tipoEntregaAtualizado = tipoEntrega ?? pedidoAtual.tipoEntrega;
            const distanciaKmAtualizado = distanciaKm ?? pedidoAtual.distanciaKm;
            const pesoCargaKgAtualizado = pesoCargaKg ?? pedidoAtual.pesoCargaKg;
            const valorKmAtualizado = valorKm ?? pedidoAtual.valorKm;
            const valorKgAtualizado = valorKg ?? pedidoAtual.valorKg;
        
            let valorDistanciaAtualizado = distanciaKmAtualizado * valorKmAtualizado;

            let valorPesoAtualizado = pesoCargaKgAtualizado * valorKgAtualizado;

            let valorFinalAtualizado = valorDistanciaAtualizado + valorPesoAtualizado;

            let acrescimoAtualizado = valorFinalAtualizado * 0.2;

            let descontoAtualizado = valorFinalAtualizado * 0.1;

            let taxaExtra = 15;

            let statusEntregaAtualizado = statusEntrega ?? pedidoAtual.statusEntrega;

            if (pesoCargaKgAtualizado > 50) {
                valorFinalAtualizado = valorFinalAtualizado + taxaExtra;
            }

            if (tipoEntregaAtualizado === "Urgente" || tipoEntregaAtualizado === "urgente") {
                valorFinalAtualizado = valorFinalAtualizado + acrescimoAtualizado;
            }

            if (valorFinalAtualizado >= 500) {
                valorFinalAtualizado = valorFinalAtualizado - descontoAtualizado;
            }

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
                statusEntregaAtualizado);

            res.status(200).json({ message: "Pedido atualizado com sucesso!" })
        } catch (error) {
            console.error('Erro ao atualizar pedido', error);
            res.status(500).json({ erro: 'Erro no servidor ao atualizar pedido!' });
        }

    },


    deletarPedido: async (req, res) => {
        try {

            const { idPedido } = req.params;

            if (idPedido.length != 36) {
                return res.status(400), json({ erro: "id do pedido inválido" });
            }

            const pedido = await pedidoModel.buscarUm(idPedido);

            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado" });
            }

            await pedidoModel.deletarPedido(idPedido);


            res.status(200).json({ message: "pedido deletado com sucesso!" })

        } catch (error) {
            console.error('Erro ao deletar pedido', error);
            res.status(500).json({ erro: 'Erro no servidor ao deletar pedido!' });
        }
    }

}

module.exports = { pedidoController }