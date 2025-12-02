const { clienteModel } = require("../model/clienteModel");

const clienteController = {

    /**
     * Lista clientes cadastrados no sistema.
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     * 
     * - Se for passado ?idCliente=UUID → retorna apenas 1 cliente.
     * - Se não enviar o ID → retorna todos os clientes.
     * 
     * @async
     * @function listarCliente
     * @param {Object} req - Objeto da requisição HTTP (contém query, params, body).
     * @param {Object} res - Objeto da resposta HTTP (onde enviamos status e JSON).
     * @returns {Promise<void>} Retorna JSON com 1 cliente ou lista de clientes.
     * @throws Retorna erro 500 se acontecer falha ao consultar o banco.
     */
    listarCliente: async (req, res) => {
        try {

            const { idCliente } = req.query;

            // Verifica se ID foi enviado
            if (idCliente) {

                // Validação simples de UUID (36 caracteres)
                if (idCliente.length != 36) {
                    return res.status(400).json({ erro: "id do Cliente invalido" });
                }

                // Busca apenas 1 cliente
                const cliente = await clienteModel.buscarUm(idCliente);
                return res.status(200).json(cliente);
            }

            // Se não enviar ID → lista todos
            const clientes = await clienteModel.buscarTodos();
            res.status(200).json(clientes);

        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).json({ message: 'erro ao buscar produtos.' });
        }
    },


    /**
     * Cadastra um novo cliente no banco de dados.
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     *
     * Campos obrigatórios:
     * {
     *  "nomeCliente": "string",
     *  "cpfCliente": "string",
     *  "telefone": "string",
     *  "email": "string",
     *  "endereco": "string"
     * }
     * 
     * - Verifica campos obrigatórios.
     * - Valida duplicidade de CPF/email.
     * - Insere no banco caso tudo esteja correto.
     * 
     * @async
     * @function criarCliente
     * @param {Object} req - Requisição contendo o corpo JSON do cliente.
     * @param {Object} res - Resposta enviada ao cliente HTTP.
     * @returns {Promise<void>} Retorna mensagem de sucesso ou erro.
     * @throws Retorna erro 500 caso ocorra falha no servidor.
     */
    criarCliente: async (req, res) => {
        try {

            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            // Campos obrigatórios
            if (!nomeCliente || !cpfCliente || !telefone || !email || !endereco) {
                return res.status(400).json({ error: 'campos obrigatorios não prenchidos!' });
            }

            // Verifica CPF/email duplicado
            const cliente = await clienteModel.buscarCpfEmail(cpfCliente, email);

            if (cliente.length > 0) {
                return res.status(409).json({ erro: "CPF ou email já cadastrado" });
            }

            // Insere cliente
            await clienteModel.inserircliente(nomeCliente, cpfCliente, telefone, email, endereco);

            res.status(201).json({ message: 'cliente cadastrado com sucesso!' });

        } catch (error) {
            console.error('erro ao cadastrar cliente:', error);
            res.status(500).json({ error: 'erro no servidor ao cadastrar cliente' });
        }
    },



    /**
     * Atualiza os dados de um cliente existente.
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     * 
     * Rota: PUT /clientes/:idCliente
     * 
     * - Atualização parcial: apenas campos enviados são alterados.
     * - Mantém valores antigos se o campo não for enviado.
     * - Valida formato do ID (UUID).
     * - Verifica duplicidade de CPF/email caso alterado.
     * 
     * @async
     * @function atualizarCliente
     * @param {Object} req - Objeto da requisição contendo params e body.
     * @param {Object} res - Objeto da resposta.
     * @returns {Promise<void>} Retorna mensagem de sucesso ou erro.
     * @throws Retorna erro 500 caso algo falhe no processamento.
     */
    atualizarCliente: async (req, res) => {

        try {

            const { idCliente } = req.params;
            const { nomeCliente, cpfCliente, telefone, email, endereco } = req.body;

            // Valida ID
            if (idCliente.length != 36) {
                return res.status(400).json({ erro: "id do cliente inválido" });
            }

            // Verifica se cliente existe
            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "cliente não encontrado" });
            }

            // Verifica duplicidade de CPF/email (se enviados)
            const clientCpf = await clienteModel.buscarCpfEmail(cpfCliente, email);

            if (clientCpf.length > 0) {
                return res.status(409).json({ erro: "CPF ou email já cadastrado" });
            }

            const clienteAtual = cliente[0];

            // Atualização apenas de campos enviados
            const nomeClienteAtualizado = nomeCliente ?? clienteAtual.nomeCliente;
            const cpfClienteAtualizado = cpfCliente ?? clienteAtual.cpfCliente;
            const telefoneAtualizado = telefone ?? clienteAtual.telefone;
            const emailAtualizado = email ?? clienteAtual.email;
            const enderecoAtualizado = endereco ?? clienteAtual.endereco;

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



    /**
     * Deleta um cliente do banco de dados.
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     * 
     * Rota: DELETE /clientes/:idCliente
     * 
     * - Valida o ID.
     * - Verifica se cliente existe antes de remover.
     * - Impede remoção caso cliente tenha pedidos associados.
     * 
     * @async
     * @function deletarCliente
     * @param {Object} req - Requisição contendo o ID do cliente.
     * @param {Object} res - Resposta HTTP.
     * @returns {Promise<void>} Retorna mensagem de sucesso ou erro.
     * @throws Retorna erro 409 caso cliente tenha pedidos cadastrados.
     */
    deletarCliente: async (req, res) => {
        try {

            const { idCliente } = req.params;

            // Valida UUID
            if (idCliente.length != 36) {
                return res.status(400).json({ erro: "id do pedido inválido" });
            }

            // Verifica se cliente existe
            const cliente = await clienteModel.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontro" });
            }

            // Remove o cliente
            await clienteModel.deletarCliente(idCliente);

            res.status(200).json({ message: "cliente deletado com sucesso!" });

        } catch (error) {
            console.error('Erro ao deletar cliente', error);
            res.status(409).json({ erro: 'impossivel deletar cliente pois ele tem pedido cadastrado!' });
        }
    }

}

module.exports = { clienteController }
