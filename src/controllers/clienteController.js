const { clienteModel } = require("../model/clienteModel");

const clienteController = {


    listarCliente: async (req, res) => {
        try {

            const { idCliente } = req.query;

            if (idCliente) {
                if (idCliente.length != 36) {
                    return res.status(400).json({ erro: "id do Cliente invalido" })

                }
                const cliente = await clienteModel.buscarUm(idCliente);
                return res.status(200).json(cliente)
            }

            const clientes = await clienteModel.buscarTodos();

            res.status(200).json(clientes);

        } catch (error) {
            console.error('Erro ao listar clientes:', error);

            res.status(500).json({ message: 'erro ao buscar produtos.' })

        }
    },


    criarCliente: async (req, res) => {
        try {

            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            const cliente = await clienteModel.buscarCpf(cpfCliente);

            if (nomeCliente == undefined || cpfCliente == undefined || telefone == undefined || email == undefined || endereco == undefined) {
                return res.status(400).json({ error: 'campos obrigatorios não prenchidos!' });
            }
            const result = await clienteModel.buscarCpf(cpfCliente);

            if (cliente.length > 0) {
                return res.status(409).json({ erro: "CPF já cadastrado" });
            }

            await clienteModel.inserircliente(nomeCliente, cpfCliente, telefone, email, endereco);

            res.status(201).json({ message: 'cliente cadastrado com sucesso!' });

        } catch (error) {
            console.error('erro ao cadastrar cliente:', error);
            res.status(500).json({ error: 'erro no servidor ao cadastrar cliente' })

        }
    },





    atualizarCliente: async (req, res) => {

        try {

            const { idCliente } = req.params;
            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            if (idCliente.length != 36) {
                return res.status(400), json({ erro: "id do cliente inválido" });
            }

            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "cliente não encontrado" });
            }
            const clientCpf = await clienteModel.buscarCpf(cpfCliente)

             if (clientCpf.length > 0) {
                return res.status(409).json({ erro: "CPF já cadastrado" });
            }


            const clienteAtual = cliente[0];

            const nomeClienteAtualizado = nomeCliente ?? clienteAtual.nomeCliente;
            const cpfClienteAtualizado = cpfCliente ?? clienteAtual.cpfCliente;
            const telefoneAtualizado = telefone ?? clienteAtual.telefone;
            const emailAtualizado = email ?? clienteAtual.email;
            const enderecoAtualizado = endereco ?? clienteAtual.endereco

            await clienteModel.atualizarCliente(idCliente, nomeClienteAtualizado, cpfClienteAtualizado, telefoneAtualizado, emailAtualizado, enderecoAtualizado);

            res.status(200).json({ message: "Cliente atualizado com sucesso!" })
        } catch (error) {
            console.error('Erro ao atualizar cliente', error);
            res.status(500).json({ erro: 'Erro no servidor ao atualizar cliente!' });
        }

    },



    deletarCliente: async (req, res) => {
        try {

            const { idCliente } = req.params;

            if (idCliente.length != 36) {
                return res.status(400), json({ erro: "id do pedido inválido" });
            }

            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontro" });
            }

            await clienteModel.deletarCliente(idCliente);


            res.status(200).json({ message: "cliente deletado com sucesso!" })

        } catch (error) {
            console.error('Erro ao deletar cliente', error);
            res.status(500).json({ erro: 'Erro no servidor ao deletar cliente!' });
        }
    }

}


module.exports = { clienteController }