const { sql, getConnection } = require("../config/db");

const clienteModel = {

    // ------------------------------------------------------
    // Buscar TODOS os clientes
    // Retorna todos os registros da tabela "clientes"
    // SELECT * FROM clientes
    // ------------------------------------------------------
    buscarTodos: async () => {
        try {

            const pool = await getConnection(); // cria conexão com BD

            let sql = 'SELECT * FROM clientes';

            const result = await pool.request().query(sql);

            return result.recordset; // retorna array com todos os clientes

        } catch (error) {
            console.error('erro ao buscar Cliente:', error);
            throw error; // repassa o erro para o controller
        }
    },



    // ------------------------------------------------------
    // Buscar UM cliente pelo ID
    // SELECT * FROM clientes WHERE idCliente = @idCliente
    // Retorna 0 ou 1 registro (array)
    // ------------------------------------------------------
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



    // ------------------------------------------------------
    // Buscar cliente pelo CPF
    // SELECT * FROM clientes WHERE cpfCliente = @cpfCliente
    // Usado para impedir CPF duplicado
    // ------------------------------------------------------
    buscarCpf: async (cpfCliente) => {
        try {

            const pool = await getConnection(); // conexão com BD

            const querySQL = 'SELECT * FROM clientes where cpfCliente = @cpfCliente';

            const result = await pool.request()
                .input('cpfCliente', sql.Char(11), cpfCliente) // campo CHAR(11)
                .query(querySQL);

            return result.recordset;

        } catch (error) {
            console.error('erro ao buscar cpf:', error);
            throw error;
        }
    },



    // ------------------------------------------------------
    // Inserir novo cliente
    // INSERT INTO clientes (...)
    // Parâmetros: nome, cpf, telefone, email, endereço
    // ------------------------------------------------------
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



    // ------------------------------------------------------
    // Atualizar cliente existente
    // UPDATE clientes SET ... WHERE idCliente = @idCliente
    // Atualiza todos os campos
    // ------------------------------------------------------
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



    // ------------------------------------------------------
    // Deletar cliente pelo ID
    // DELETE FROM clientes WHERE idCliente = @idCliente
    // Usa transação para garantir integridade
    // ------------------------------------------------------
    deletarCliente: async (idCliente) => {

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        await transaction.begin(); // inicia transação

        try {

            // Exclui registro da tabela Clientes
            let querySQL = `
                DELETE FROM Clientes
                WHERE idCliente = @idCliente
            `;

            await transaction.request()
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .query(querySQL);

            // OBS: esta segunda exclusão parece incorreta (tabela "Cliente"?)
            querySQL = `
                DELETE FROM Cliente
                WHERE idCliente = @idCliente
            `;

            // Commit da transação
            await transaction.commit();

        } catch (error) {

            // Caso dê erro, desfaz tudo
            await transaction.rollback();

            console.error("erro ao deletar cliente:", error);
            throw error;
        }
    }

}

module.exports = { clienteModel };
