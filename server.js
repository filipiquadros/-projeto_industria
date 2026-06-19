import Fastify from "fastify";
import { Pool } from "pg";
import cors from '@fastify/cors';
import rotaProdutos from "./routes/produtos.js";

export const sql = new Pool({
    user: "postgres",
    password: "1234",
    host: "localhost",
    port: 5432,
    database: "webstock"
});

const servidor = Fastify()

servidor.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

servidor.register(rotaProdutos);

servidor.listen({ port: 3000 })
