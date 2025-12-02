const { sql, getConnection } = require("../config/db");

const clienteModel = {

    /**
     * Busca **todos** os clientes cadastrados na tabela "clientes".
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     * 
     * Executa:
     * SELECT * FROM clientes
     * 
     * @async
     * @function buscarTodos
     * @returns {Promise<Array>} Retorna um array contendo todos os clientes do banco.
     * @throws Lança erro caso a consulta ao banco falhe.
     */
    buscarTodos: async () => {
        try {

            const pool = await getConnection(); // cria conexão com BD

            let sqlQuery = 'SELECT * FROM clientes';

            const result = await pool.request().query(sqlQuery);

            return result.recordset; // retorna array com todos os clientes

        } catch (error) {
            console.error('erro ao buscar Cliente:', error);
            throw error; // repassa o erro para o controller
        }
    },



    /**
     * Busca **um único cliente** pelo ID (UUID).
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     * 
     * Executa:
     * SELECT * FROM clientes WHERE idCliente = @idCliente
     * 
     * @async
     * @function buscarUm
     * @param {string} idCliente - ID do cliente no formato UUID.
     * @returns {Promise<Array>} Retorna array com 0 ou 1 registros.
     * @throws Lança erro caso ocorra falha na consulta.
     */
    buscarUm: async (idCliente) => {
        try {

            const pool = await getConnection(); // conexão com BD

            const querySQL = 'SELECT * FROM clientes where idCliente = @idCliente';

            const result = await pool.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente) // parâmetro do tipo UUID
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error('erro ao buscar o cliente:', error);
            throw error;
        }
    },



    /**
     * Busca cliente pelo **CPF** ou **email**.
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     *
     * Usado para validar duplicidade no cadastro.
     * 
     * Executa:
     * SELECT * FROM clientes WHERE cpfCliente = @cpfCliente OR email = @email
     * 
     * @async
     * @function buscarCpfEmail
     * @param {string} cpfCliente - CPF do cliente (CHAR 11).
     * @param {string} email - Email do cliente.
     * @returns {Promise<Array>} Retorna array com registros encontrados.
     * @throws Lança erro caso a consulta falhe.
     */
    buscarCpfEmail: async (cpfCliente, email) => {
        try {

            const pool = await getConnection(); // conexão com BD

            const querySQL = 'SELECT * FROM clientes where cpfCliente = @cpfCliente or email = @email';

            const result = await pool.request()
                .input('cpfCliente', sql.Char(11), cpfCliente) // campo CHAR(11)
                .input('email', sql.VarChar(50), email)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error('erro ao buscar cpf/email:', error);
            throw error;
        }
    },



    /**
     * Insere um novo cliente na tabela "clientes".
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     * 
     * Executa:
     * INSERT INTO clientes (nomeCliente, cpfCliente, telefone, email, endereco) VALUES (...)
     * 
     * @async
     * @function inserircliente
     * @param {string} nomeCliente - Nome completo do cliente.
     * @param {string} cpfCliente - CPF do cliente.
     * @param {string} telefone - Telefone do cliente.
     * @param {string} email - Email do cliente.
     * @param {string} endereco - Endereço completo.
     * @returns {Promise<void>} Não retorna dados, apenas executa o INSERT.
     * @throws Lança erro caso ocorra falha ao inserir.
     */
    inserircliente: async (nomeCliente, cpfCliente, telefone, email, endereco) => {
        try {

            const pool = await getConnection();

            const querySQL = `
                INSERT INTO clientes
                (nomeCliente, cpfCliente, telefone, email, endereco)
                VALUES
                (@nomeCliente, @cpfCliente, @telefone, @email, @endereco)
            `;

            await pool.request()
                .input('nomeCliente', sql.VarChar(50), nomeCliente)
                .input('cpfCliente', sql.Char(11), cpfCliente)
                .input('telefone', sql.VarChar(20), telefone)
                .input('email', sql.VarChar(50), email)
                .input('endereco', sql.VarChar(250), endereco)
                .query(querySQL);

        } catch (error) {
            console.error('erro ao inserir cliente:', error);
            throw error;
        }
    },



    /**
     * Atualiza um cliente existente no banco.
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     * 
     * Executa:
     * UPDATE clientes SET ... WHERE idCliente = @idCliente
     * 
     * @async
     * @function atualizarCliente
     * @param {string} idCliente - ID do cliente (UUID).
     * @param {string} nomeCliente - Novo nome.
     * @param {string} cpfCliente - Novo CPF.
     * @param {string} telefone - Novo telefone.
     * @param {string} email - Novo email.
     * @param {string} endereco - Novo endereço.
     * @returns {Promise<void>} Apenas executa a atualização.
     * @throws Lança erro caso ocorra falha na atualização.
     */
    atualizarCliente: async (idCliente, nomeCliente, cpfCliente, telefone, email, endereco) => {
        try {

            const pool = await getConnection();

            const querySQL = `
                UPDATE clientes
                SET nomeCliente = @nomeCliente,
                    cpfCliente = @cpfCliente,
                    telefone = @telefone,
                    email = @email,
                    endereco = @endereco
                WHERE idCliente = @idCliente
            `;

            await pool.request()
                .input("nomeCliente", sql.VarChar(100), nomeCliente)
                .input("cpfCliente", sql.Char(11), cpfCliente)
                .input("telefone", sql.VarChar(20), telefone)
                .input("email", sql.VarChar(50), email)
                .input("endereco", sql.VarChar(250), endereco)
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .query(querySQL);

        } catch (error) {
            console.error("erro ao atualizar cliente:", error);
            throw error;
        }
    },



    /**
     * Deleta um cliente pelo ID utilizando transação.
     * 
     * Sempre que começa com a {chave} é um objeto JavaScript.
     * 
     * Executa:
     * DELETE FROM Clientes WHERE idCliente = @idCliente
     *
     * - Usa transação para garantir integridade.
     * - Se falhar, faz rollback.
     * 
     * OBS: a segunda exclusão (tabela "Cliente") parece um erro de digitação.
     * 
     * @async
     * @function deletarCliente
     * @param {string} idCliente - ID do cliente (UUID).
     * @returns {Promise<void>} Não retorna nada. Apenas executa o DELETE.
     * @throws Lança erro caso a operação falhe.
     */
    deletarCliente: async (idCliente) => {

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        await transaction.begin(); // inicia transação

        try {

            // Exclui na tabela correta
            let querySQL = `
                DELETE FROM Clientes
                WHERE idCliente = @idCliente
            `;

            await transaction.request()
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .query(querySQL);

            // POSSÍVEL ERRO: tabela "Cliente" não existe
            querySQL = `
                DELETE FROM Cliente
                WHERE idCliente = @idCliente
            `;

            // Commit
            await transaction.commit();

        } catch (error) {

            // Se der erro, desfaz tudo
            await transaction.rollback();

            console.error("erro ao deletar cliente:", error);
            throw error;
        }
    }

}

module.exports = { clienteModel };

