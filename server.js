import Fastify from "fastify";
import { Pool } from "pg";
import cors from '@fastify/cors';

const sql = new Pool({
    user: "postgres",
    password: "1234",
    host: "localhost",
    port: 5432,
    database: "webstock"
})

const servidor = Fastify()

servidor.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
})

servidor.get('/usuarios', async () => {
    const result = await sql.query('SELECT * FROM usuarios')
    return result.rows
})

servidor.post('/usuarios', async (request, reply) => {
    const nome = request.body.nome;
    const senha = request.body.senha;
    const email = request.body.email;

    if (!nome || !senha || !email) {
        reply.status(400).send({ error: 'Nome, senha, email são obrigatórios!' })
    }
    const resultado = await sql.query('INSERT INTO usuarios (nome, senha, email) VALUES ($1, $2, $3)', [nome, senha, email]);
    reply.status(201).send({ message: 'Usuario Cadastrado!' })
})

servidor.get('/produtos', async () => {
    const result = await sql.query('SELECT * FROM produtos')
    return result.rows
})
servidor.listen({ port: 3000 })
