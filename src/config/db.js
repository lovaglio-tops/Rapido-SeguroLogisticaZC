const { get } = require("http");
const sql = require("mssql");
const config = {
    user: process.env.USER_DB,
    password: process.env.USER_PASSWORD,
    server:  process.env.USER_SERVER,
    database: process.env.USER_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}


async function getConnection() {
    try {

        const pool = await sql.connect(config);
        return pool;

    } catch (error) {
        console.error('erro na conexão do SQL server:', error);
    }
};

(async () => {
    const pool = await getConnection();

    if (pool) {
        console.log("Conectado com o BD com sucesso!");
    }
})();

module.exports = {sql, getConnection};