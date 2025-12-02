const { VarChar } = require("mssql");
const { sql, getConnection } = require("../config/db");

/**
 * Objeto que representa o Model de Pedidos.
 * Contém funções responsáveis por buscar, inserir, atualizar e deletar pedidos no banco de dados.
 * 
 * Sempre que começa com {chave} é um objeto JavaScript.
 */
const pedidoModel = {

    /**
     * Busca todos os pedidos cadastrados no banco de dados.
     * Realiza INNER JOIN com Clientes e Entregas para retornar dados completos.
     * 
     * @async
     * @function buscarTodos
     * @returns {Promise<Array>} Retorna lista de pedidos completos.
     * @throws Mostra no console e lança o erro caso a consulta falhe.
     */
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

    /**
     * Busca um único pedido pelo ID.
     * Retorna também suas informações de entrega e cliente.
     * 
     * @async
     * @function buscarUm
     * @param {string} idPedido - ID do pedido (GUID).
     * @returns {Promise<Array>} Retorna um array contendo o pedido encontrado.
     * @throws Mostra no console e lança o erro caso falhe.
     */
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

    /**
     * Insere um novo pedido e sua respectiva entrega utilizando transação.
     * O pedido é inserido primeiro → retorna idPedido → insere a entrega vinculada.
     * 
     * @async
     * @function inserirPedido
     * @param {string} idCliente - GUID do cliente
     * @param {Date} dataPedido - Data do pedido
     * @param {string} tipoEntrega - Tipo de entrega (Ex: "Rápida", "Normal")
     * @param {number} distanciaKm - Distância em quilômetros
     * @param {number} pesoCargaKg - Peso da carga em KG
     * @param {number} valorKm - Valor por KM
     * @param {number} valorKg - Valor por KG
     * @param {number} valorDistancia - Valor calculado pela distância
     * @param {number} valorPeso - Valor calculado pelo peso
     * @param {number} acrescimo - Acréscimos extras
     * @param {number} desconto - Descontos aplicados
     * @param {number} taxaExtra - Taxas adicionais
     * @param {number} valorFinal - Valor total final do pedido
     * @param {string} statusEntrega - Status da entrega (ex: "Pendente")
     * @returns {Promise<void>}
     * @throws Realiza rollback e lança o erro caso a transação falhe.
     */
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

    /**
     * Atualiza um pedido existente e sua respectiva entrega.
     * Utiliza transação para garantir integridade dos dados.
     * 
     * @async
     * @function atualizarPedido
     * @param {string} idPedido - ID do pedido (GUID)
     * @param {...any} dados - Todos os dados necessários para atualizar os registros
     * @returns {Promise<void>}
     * @throws Realiza rollback e lança erro caso aconteça falha na transação.
     */
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

    /**
     * Deleta um pedido e sua respectiva entrega.
     * Efetua duas remoções dentro de uma transação.
     * 
     * @async
     * @function deletarPedido
     * @param {string} idPedido - ID do pedido que será removido
     * @returns {Promise<void>}
     * @throws Realiza rollback e lança o erro caso algo falhe.
     */
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
