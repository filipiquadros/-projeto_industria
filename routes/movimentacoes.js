import { sql } from "../server.js";

export default async function movimentacaoRoutes(servidor) {
  

  servidor.post("/api/movimentacoes", async (request, reply) => {
    const { produto_id, tipo, quantidade } = request.body;
    if (!produto_id || !quantidade || quantidade <= 0) {
      return reply.code(400).send({ error: "Dados inválidos. Verifique o ID do produto e a quantidade." });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return reply.code(400).send({ error: "Tipo de movimentação inválido. Use 'entrada' ou 'saida'." });
    }


    const client = await sql.connect();

    try {
      await client.query("BEGIN");


      const prodResult = await client.query(
        "SELECT quantidade, estoque_minimo, nome FROM produtos WHERE id = $1 FOR UPDATE", 
        [produto_id]
      );

      if (prodResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return reply.code(404).send({ error: "Produto não encontrado." });
      }

      const produto = prodResult.rows[0];
      let novaQuantidade = produto.quantidade;


      if (tipo === "entrada") {
        novaQuantidade += quantidade;
      } else if (tipo === "saida") {
        if (produto.quantidade < quantidade) {
          await client.query("ROLLBACK");
          return reply.code(400).send({ error: "Saldo insuficiente para realizar esta saída." });
        }
        novaQuantidade -= quantidade;
      }


      await client.query(
        "INSERT INTO movimentacoes (produto_id, tipo, quantidade) VALUES ($1, $2, $3)",
        [produto_id, tipo, quantidade]
      );


      const updateResult = await client.query(
        "UPDATE produtos SET quantidade = $1 WHERE id = $2 RETURNING *",
        [novaQuantidade, produto_id]
      );

      await client.query("COMMIT");

      const produtoAtualizado = updateResult.rows[0];


      let alertaEstoque = null;
      if (produtoAtualizado.quantidade <= produtoAtualizado.estoque_minimo) {
        alertaEstoque = `Alerta: O produto '${produtoAtualizado.nome}' atingiu o nível crítico de estoque (${produtoAtualizado.quantidade} unidades).`;
      }

      return reply.code(201).send({
        message: "Movimentação realizada com sucesso!",
        saldo_anterior: produto.quantidade,
        saldo_atual: produtoAtualizado.quantidade,
        alerta: alertaEstoque
      });

    } catch (error) {
      await client.query("ROLLBACK");
      servidor.log.error(error);
      return reply.code(500).send({ error: "Erro interno ao processar a movimentação." });
    } finally {
      client.release(); 
    }
  });

  servidor.get("/api/movimentacoes", async (request, reply) => {
    const result = await sql.query(`
      SELECT m.id, p.nome AS produto, m.tipo, m.quantidade, m.data 
      FROM movimentacoes m
      JOIN produtos p ON m.produto_id = p.id
      ORDER BY m.data DESC
    `);
    return result.rows;
  });
}