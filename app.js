require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 8081;
const { clienteRoutes } = require("./src/routes/clienteRoutes");
const { pedidoRoutes } = require("./src/routes/pedidoRoutes");
app.use(express.json());

app.use('/', clienteRoutes);
app.use('/', pedidoRoutes);

app.listen(PORT, () => {
    console.log(`servidor rodando em http://localhost:${PORT}`);

});