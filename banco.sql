
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    quantidade INT DEFAULT 0 NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    estoque_minimo INT DEFAULT 5 NOT NULL
);

CREATE TABLE movimentacoes (
    id SERIAL PRIMARY KEY,
    produto_id INT NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    quantidade INT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);
