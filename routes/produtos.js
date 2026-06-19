import { sql } from "../server.js";

export default async function produtoRoutes(servidor) {
  servidor.get("/api/produtos", async (request, reply) => {
    const result = await sql.query("SELECT * FROM produtos");
    return result.rows;
  });

  servidor.post("/api/produtos", async (request, reply) => {
    const { nome, categoria, preco, estoque_minimo } = request.body;

    const result = await sql.query(
      "INSERT INTO produtos (nome, categoria, preco, estoque_minimo, quantidade) VALUES ($1, $2, $3, $4, 0) RETURNING *",
      [nome, categoria, preco, estoque_minimo || 5],
    );

    return reply.code(201).send({ message: "Produto Cadastrado!" });
  });

  servidor.put("/api/produtos/:id", async (request, reply) => {
    const { id } = request.params;
    const { nome, categoria, quantidade, preco, estoque_minimo } = request.body;

    const result = await sql.query(
      `UPDATE produtos SET nome = $1, categoria = $2, quantidade = $3, preco = $4, estoque_minimo = $5 WHERE id = $6 RETURNING *`,
      [nome, categoria, quantidade, preco, estoque_minimo, id],
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: "Produto não encontrado." });
    }
    return reply.status(201).send({ message: "Produto Alterado!" });
  });

  servidor.get("/api/produtos/:id", async (request, reply) => {
    const { id } = request.params;
    const result = await sql.query("SELECT * FROM produtos WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: "Produto não encontrado." })}

    return result.rows[0]; 
  });

  servidor.delete("/api/produtos/:id", async (request, reply) => {
    const { id } = request.params;
    const result = await sql.query("DELETE FROM produtos WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: "Produto não encontrado." });
    }

    return reply.code(204).send(); 
  });
  
}