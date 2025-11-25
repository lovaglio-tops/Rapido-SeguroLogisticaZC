const { clienteModel } = require("../model/clienteModel");

const clienteController = {

    // ---------------------------------------------
    // Listar clientes
    // GET /clientes
    // Se for passado ?idCliente=UUID → retorna apenas 1 cliente
    // Caso contrário → retorna todos os clientes
    // ---------------------------------------------
    listarCliente: async (req, res) => {
        try {

            const { idCliente } = req.query;

            // Valida se foi enviado o ID do cliente
            if (idCliente) {
                // Verifica se o ID possui formato válido (UUID com 36 caracteres)
                if (idCliente.length != 36) {
                    return res.status(400).json({ erro: "id do Cliente invalido" });
                }

                // Busca um único cliente pelo ID
                const cliente = await clienteModel.buscarUm(idCliente);
                return res.status(200).json(cliente);
            }

            // Caso não haja ID, lista todos os clientes
            const clientes = await clienteModel.buscarTodos();
            res.status(200).json(clientes);

        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ message: 'erro ao buscar produtos.' });
        }
    },


    // ---------------------------------------------
    // Criar um novo cliente
    // POST /clientes
    // Corpo esperado:
    /*
        {
            "nomeCliente": "valor",
            "cpfCliente": "valor",
            "telefone": "valor",
            "email": "valor",
            "endereco": "valor"
        }
    */
    // Verifica campos obrigatórios, valida CPF duplicado e insere na base
    // ---------------------------------------------
    criarCliente: async (req, res) => {
        try {

            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            // Verifica se todos os campos obrigatórios foram preenchidos
            if (!nomeCliente || !cpfCliente || !telefone || !email || !endereco) {
                return res.status(400).json({ error: 'campos obrigatorios não prenchidos!' });
            }

            // Verifica se o CPF já está cadastrado
            const cliente = await clienteModel.buscarCpf(cpfCliente);

            if (cliente.length > 0) {
                return res.status(409).json({ erro: "CPF já cadastrado" });
            }

            // Insere o cliente
            await clienteModel.inserircliente(nomeCliente, cpfCliente, telefone, email, endereco);

            res.status(201).json({ message: 'cliente cadastrado com sucesso!' });

        } catch (error) {
            console.error('erro ao cadastrar cliente:', error);
            res.status(500).json({ error: 'erro no servidor ao cadastrar cliente' });
        }
    },



    // ---------------------------------------------
    // Atualizar um cliente existente
    // PUT /clientes/:idCliente
    // Permite atualizar campos individualmente (patch manual)
    // Mantém valores antigos caso um campo não seja enviado
    // ---------------------------------------------
    atualizarCliente: async (req, res) => {

        try {

            const { idCliente } = req.params;
            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            // Valida o formato do ID
            if (idCliente.length != 36) {
                return res.status(400).json({ erro: "id do cliente inválido" });
            }

            // Verifica se o cliente existe
            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "cliente não encontrado" });
            }

            // Se CPF for informado, verifica duplicidade
            const clientCpf = await clienteModel.buscarCpf(cpfCliente);

            if (clientCpf.length > 0) {
                return res.status(409).json({ erro: "CPF já cadastrado" });
            }

            // Dados atuais do cliente
            const clienteAtual = cliente[0];

            // Atualiza somente os campos enviados (nullish coalescing)
            const nomeClienteAtualizado = nomeCliente ?? clienteAtual.nomeCliente;
            const cpfClienteAtualizado = cpfCliente ?? clienteAtual.cpfCliente;
            const telefoneAtualizado = telefone ?? clienteAtual.telefone;
            const emailAtualizado = email ?? clienteAtual.email;
            const enderecoAtualizado = endereco ?? clienteAtual.endereco;

            // Atualiza cliente no banco
            await clienteModel.atualizarCliente(
                idCliente,
                nomeClienteAtualizado,
                cpfClienteAtualizado,
                telefoneAtualizado,
                emailAtualizado,
                enderecoAtualizado
            );

            res.status(200).json({ message: "Cliente atualizado com sucesso!" })
        } catch (error) {
            console.error('Erro ao atualizar cliente', error);
            res.status(500).json({ erro: 'Erro no servidor ao atualizar cliente!' });
        }

    },



    // ---------------------------------------------
    // Deletar um cliente
    // DELETE /clientes/:idCliente
    // Verifica se existe antes de deletar
    // ---------------------------------------------
    deletarCliente: async (req, res) => {
        try {

            const { idCliente } = req.params;

            // Valida o ID do cliente
            if (idCliente.length != 36) {
                return res.status(400).json({ erro: "id do pedido inválido" });
            }

            // Verifica se o cliente existe
            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontro" });
            }

            // Remove o cliente
            await clienteModel.deletarCliente(idCliente);

            res.status(200).json({ message: "cliente deletado com sucesso!" });

        } catch (error) {
            console.error('Erro ao deletar cliente', error);
            res.status(500).json({ erro: 'Erro no servidor ao deletar cliente!' });
        }
    }

}

module.exports = { clienteController }
