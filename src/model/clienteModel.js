const { sql, getConnection } = require("../config/db");

const clienteModel = {
    buscarTodos: async () => {
        try {

            const pool = await getConnection();//cria conexão com BD

            let sql = 'SELECT * FROM clientes';

            const result = await pool.request().query(sql);

            return result.recordset;

        } catch (error) {
            console.error('erro ao buscar Cliente:', error);
            throw error;//passa o erro para o controller tratar
        }
    },



    buscarUm: async (idCliente) => {
        try {

            const pool = await getConnection();//cria conexão com BD

            let querySQL = 'SELECT * FROM clientes where idCliente = @idCliente';

            const result = await pool.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .query(querySQL);
            return result.recordset
        } catch (error) {
            console.error('erro ao buscar o cliente:', error);
            throw error;//passa o erro para o controler tratar
        }
    },



    buscarCpf: async (cpfCliente) => {
        try {

            const pool = await getConnection();//cria conexão com BD

            let querySQL = 'SELECT * FROM clientes where cpfCliente = @cpfCliente';

            const result = await pool.request()
                .input('cpfCliente', sql.Char(11), cpfCliente)
                .query(querySQL);
            return result.recordset
        } catch (error) {
            console.error('erro ao buscar cpf:', error);
            throw error;//passa o erro para o controler tratar
        }
    },





    inserircliente: async (nomeCliente, cpfCliente, telefone, email, endereco) => {
        try {
            const pool = await getConnection();

            let querySQL = 'INSERT INTO clientes(nomeCliente,  cpfCliente, telefone, email, endereco) values(@nomeCliente, @cpfCliente, @telefone, @email, @endereco)'

            await pool.request()
                .input('nomeCliente', sql.VarChar(50), nomeCliente)
                .input('cpfCliente', sql.Char(11), cpfCliente)
                .input('telefone', sql.VarChar(20), telefone)
                .input('email', sql.VarChar(50), email)
                .input('endereco', sql.VarChar(250), endereco)
                .query(querySQL);
        } catch (error) {
            console.error('erro ao inserir cliente:', error);
            throw error;//passa o erro para o controler tratar

        }
    },



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
            `

            await pool.request()
                .input("nomeCliente", sql.VarChar(100), nomeCliente)
                .input("cpfCliente", sql.Char(11), cpfCliente)
                .input("telefone", sql.VarChar(20), telefone)
                .input("email", sql.VarChar(50), email)
                .input("endereco", sql.VarChar(250), endereco)
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .query(querySQL)


        } catch (error) {
            console.error("erro ao atualizar cliente:", error);
            throw error;
        }


    },

    deletarCliente: async (idCliente) => {
        
        
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();        
        try {
            let querySQL = `
            DELETE FROM Clientes
            WHERE idCliente = @idCliente
            `
           await transaction.request()
           .input("idCliente", sql.UniqueIdentifier, idCliente)
           .query(querySQL);

            querySQL = `
            DELETE FROM Cliente
            WHERE idCliente = @idCliente
            `
            await transaction.commit();

        } catch (error) {
            await transaction.rollback();
            console.error("erro ao deletar cliente:", error);
            throw error;
        }
    }

}


module.exports = { clienteModel }