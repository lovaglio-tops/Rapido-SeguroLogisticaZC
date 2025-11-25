const { VarChar } = require("mssql");
const { sql, getConnection } = require("../config/db");

const pedidoModel = {

    buscarTodos: async () => {
        try {

            const pool = await getConnection();//cria conexão com BD

            let sql = `
            SELECT Clientes.idCliente, Pedidos.idPedido, clientes.nomeCliente,dataPedido, Entregas.valorFinal, Entregas.statusEntrega, tipoEntrega, pedidos.distanciaKm, pedidos.pesoCargaKg, pedidos.valorKm, 
            pedidos.valorKg, entregas.valorDistancia, entregas.valorPeso, entregas.acrescimo, entregas.desconto,entregas.taxaExtra
            FROM Pedidos 
            INNER JOIN Entregas on Pedidos.idPedido = Entregas.idPedido
            INNER JOIN Clientes on Pedidos.idCliente = Clientes.idCliente
            `;

            const result = await pool.request().query(sql);

            return result.recordset;

        } catch (error) {
            console.error('erro ao buscar os Pedidos:', error);
            throw error;//passa o erro para o controller tratar
        }
    },



    buscarUm: async (idPedido) => {
        try {

            const pool = await getConnection();//cria conexão com BD

            let querySQL = `
            SELECT Clientes.idCliente, Pedidos.idPedido, entregas.idEntrega, clientes.nomeCliente,dataPedido, Entregas.valorFinal, Entregas.statusEntrega, tipoEntrega, pedidos.distanciaKm, pedidos.pesoCargaKg, pedidos.valorKm, 
            pedidos.valorKg, entregas.valorDistancia, entregas.valorPeso, entregas.acrescimo, entregas.desconto,entregas.taxaExtra
            FROM Pedidos 
            INNER JOIN Entregas ON Pedidos.idPedido = Entregas.idPedido
            INNER JOIN Clientes ON Pedidos.idCliente = Clientes.idCliente
            where Pedidos.idPedido = @idPedido`;

            const result = await pool.request()
                .input('idPedido', sql.UniqueIdentifier, idPedido)
                .query(querySQL);
            return result.recordset
        } catch (error) {
            console.error('erro ao buscar o pedido:', error);
            throw error;//passa o erro para o controler tratar
        }
    },






    inserirPedido: async (
        idCliente,
        dataPedido,
        tipoEntrega,
        distanciaKm,
        pesoCargaKg,
        valorKm,
        valorKg,
        valorDistancia,
        valorPeso,
        acrescimo,
        desconto,
        taxaExtra,
        valorFinal,
        statusEntrega) => {

        const pool = await getConnection();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();//inicia a transaçao
        try {

            let querySQL =
                `INSERT INTO Pedidos (idCliente, dataPedido, tipoEntrega, distanciaKm, pesoCargaKg, valorKm, valorKg) 
                OUTPUT INSERTED.idPedido
                values(@idCliente, @dataPedido, @tipoEntrega, @distanciaKm, @pesoCargaKg, @valorKm, @valorKg)`

            const result = await transaction.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .input('dataPedido', sql.Date, dataPedido)
                .input('tipoEntrega', sql.VarChar(10), tipoEntrega)
                .input('distanciaKm', sql.Decimal(10, 2), distanciaKm)
                .input('pesoCargaKg', sql.Decimal(10, 2), pesoCargaKg)
                .input('valorKm', sql.Decimal(10, 2), valorKm)
                .input('valorKg', sql.Decimal(10, 2), valorKg)
                .query(querySQL);

            const idPedido = result.recordset[0].idPedido;

            querySQL = `
            INSERT INTO Entregas (idPedido, valorDistancia, valorPeso, acrescimo, desconto, taxaExtra, valorFinal, statusEntrega) 
            VALUES (@idPedido, @valorDistancia, @valorPeso, @acrescimo, @desconto, @taxaExtra,@valorFinal, @statusEntrega)`

            await transaction.request()
                .input('idPedido', sql.UniqueIdentifier, idPedido)
                .input('valorDistancia', sql.Decimal(10, 2), valorDistancia)
                .input('valorPeso', sql.Decimal(10, 2), valorPeso)
                .input('acrescimo', sql.Decimal(10, 2), acrescimo)
                .input('desconto', sql.Decimal(10, 2), desconto)
                .input('taxaExtra', sql.Decimal(10, 2), taxaExtra)
                .input('valorFinal', sql.Decimal(10, 2), valorFinal)
                .input('statusEntrega', sql.VarChar(11), statusEntrega)
                .query(querySQL);

            await transaction.commit();


        } catch (error) {
            console.error("ERRO ORIGINAL:", error.originalError?.message || error.message);
            await transaction.rollback();
            throw error;
        }
    },

    atualizarPedido: async (
        idPedido,
        idCliente,
        dataPedido,
        tipoEntrega,
        distanciaKm,
        pesoCargaKg,
        valorKm,
        valorKg,
        valorDistancia,
        valorPeso,
        acrescimo,
        desconto,
        taxaExtra,
        valorFinal,
        statusEntrega) => {

        console.log(idPedido, idCliente, dataPedido, tipoEntrega, distanciaKm, pesoCargaKg, valorKm, valorKg, valorDistancia, valorPeso, acrescimo, desconto, taxaExtra, valorFinal, statusEntrega);
        const pool = await getConnection();

        const transaction = new sql.Transaction(pool);
        await transaction.begin();//inicia a transaçao

        try {

            let querySQL = `
            UPDATE Pedidos
            SET idCliente = @idCliente,
                dataPedido = @dataPedido,
                tipoEntrega = @tipoEntrega,
                distanciaKm = @distanciaKm,
                pesoCargaKg = @pesoCargaKg,
                valorKm = @valorKm,
                valorKg = @valorKg
            WHERE idPedido = @idPedido
            `

            const result = await transaction.request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .input('dataPedido', sql.Date, dataPedido)
                .input('tipoEntrega', sql.VarChar(10), tipoEntrega)
                .input('distanciaKm', sql.Decimal(10, 2), distanciaKm)
                .input('pesoCargaKg', sql.Decimal(10, 2), pesoCargaKg)
                .input('valorKm', sql.Decimal(10, 2), valorKm)
                .input('valorKg', sql.Decimal(10, 2), valorKg)
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            querySQL = ` 
                 UPDATE entregas
            SET 
            valorDistancia = @valorDistancia, 
            valorPeso = @valorPeso, 
            acrescimo = @acrescimo,
            desconto = @desconto, 
            taxaExtra = @taxaExtra,
            valorFinal = @valorFinal, 
            statusEntrega = @statusEntrega
            WHERE idPedido = @idPedido
            `
            await transaction.request()
                .input('valorDistancia', sql.Decimal(10, 2), valorDistancia)
                .input('valorPeso', sql.Decimal(10, 2), valorPeso)
                .input('acrescimo', sql.Decimal(10, 2), acrescimo)
                .input('desconto', sql.Decimal(10, 2), desconto)
                .input('taxaExtra', sql.Decimal(10, 2), taxaExtra)
                .input('valorFinal', sql.Decimal(10, 2), valorFinal)
                .input('statusEntrega', sql.VarChar(11), statusEntrega)
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL)

            await transaction.commit();

        } catch (error) {
            console.error("erro ao atualizar pedido:", error);
            console.error("ERRO ORIGINAL:", error.originalError?.message || error.message);
            await transaction.rollback();
            throw error;
        }


    },

    deletarPedido: async (idPedido) => {


        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            let querySQL = `
            DELETE FROM pedidos
            WHERE idPedido = @idPedido
            `
            const result = await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            querySQL = `
            DELETE FROM entregas
            WHERE idPedido = @idPedido
            `

             await transaction.request()
             .input("idPedido", sql.UniqueIdentifier, idPedido)
             .query(querySQL)
            
            
             await transaction.commit();

        } catch (error) {
            await transaction.rollback();
            console.error("erro ao deletar pedido:", error);
            throw error;
        }
    },

}


module.exports = { pedidoModel }