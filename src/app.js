const express = require("express");

const app = express();4

let livros = [
  { id: 1, nome: "Harry Potter e a Pedra Filosofal", autor: "J.K. Rowling", ano: 1997 },
  { id: 2, nome: "Harry Potter e a Câmara Secreta", autor: "J.K. Rowling", ano: 1998 },
  { id: 3, nome: "Harry Potter e o Prisioneiro de Azkaban", autor: "J.K. Rowling", ano: 1999 },
  { id: 4, nome: "Harry Potter e o Cálice de Fogo", autor: "J.K. Rowling", ano: 2000 },
  { id: 5, nome: "Harry Potter e a Ordem da Fênix", autor: "J.K. Rowling", ano: 2003 },
  { id: 6, nome: "Harry Potter e o Enigma do Príncipe", autor: "J.K. Rowling", ano: 2005 },
  { id: 7, nome: "Harry Potter e as Relíquias da Morte", autor: "J.K. Rowling", ano: 2007 },
];

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API no ar" });
});

app.get("/livros", (req, res) => {
  res.json({
    livros: livros,
  });
});

app.get("/livros/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    livro: livros.find(livro => livro.id === id),
  });
});


app.post("/livros", (req, res) => {
  const { nome, autor, ano } = req.body;
  const novoLivro = { id: livros.length + 1, nome, autor, ano };
  livros.push(novoLivro);
  res.json({
    livro: novoLivro,
  });
});

app.put("/livros/:id", (req, res) => {
  const { id } = req.params;
  const { nome, autor, ano } = req.body;

  const livro = livros.find(livro => livro.id === id);
  if (!livro) {
    return res.status(404).json({ message: "Livro não encontrado" });
  }
  livro.nome = nome;
  livro.autor = autor;
  livro.ano = ano;
  res.json({
    livro: livro,
  });
});

app.delete("/livros/:id", (req, res) => {
  const { id } = req.params;
  const livro = livros.find(livro => livro.id === id);
  if (!livro) {
    return res.status(404).json({ message: "Livro não encontrado" });
  }
  livros = livros.filter(livro => livro.id !== id);
  res.json({ message: "Livro deletado com sucesso" });
});

//api v2 with sqlite
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("livros.db");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS livros (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, autor TEXT, ano INTEGER)");
});

db.close();

app.get("/v2/livros", (req, res) => {
  db.all("SELECT * FROM livros", (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao buscar livros" });
    }
    res.json({ livros: rows });
  });
});

app.get("/v2/livros/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM livros WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao buscar livro" });
    }
    res.json({ livro: row });
  });
});

app.post("/v2/livros", (req, res) => {
  const { nome, autor, ano } = req.body;
  db.run("INSERT INTO livros (nome, autor, ano) VALUES (?, ?, ?)", [nome, autor, ano], function(err) {
    if (err) {
      return res.status(500).json({ message: "Erro ao criar livro" });
    }
    res.json({ livro: { id: this.lastID, nome, autor, ano } });
  });
});

app.put("/v2/livros/:id", (req, res) => {
  const { id } = req.params;
  const { nome, autor, ano } = req.body;
  db.run("UPDATE livros SET nome = ?, autor = ?, ano = ? WHERE id = ?", [nome, autor, ano, id], function(err) {
    if (err) {
      return res.status(500).json({ message: "Erro ao atualizar livro" });
    }
    res.json({ livro: { id: this.lastID, nome, autor, ano } });
  });
});

app.delete("/v2/livros/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM livros WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ message: "Erro ao deletar livro" });
    }
    res.json({ message: "Livro deletado com sucesso" });
  });
});

//api v3 with poo
const db2 = new sqlite3.Database("livros2.db");

db2.serialize(() => {
  db2.run("CREATE TABLE IF NOT EXISTS livros (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, autor TEXT, ano INTEGER)");
});

db2.close();

class Livro {
  constructor(id, nome, autor, ano) {
    this.id = id;
    this.nome = nome;
    this.autor = autor;
    this.ano = ano;
  }
}

class LivroDAO {
  constructor(db) {
    this.db = db;
  }
}

const livroDAO = new LivroDAO(db2);

livroDAO.createTable();

livroDAO.create(new Livro(1, "Harry Potter e a Pedra Filosofal", "J.K. Rowling", 1997));
livroDAO.create(new Livro(2, "Harry Potter e a Câmara Secreta", "J.K. Rowling", 1998));
livroDAO.create(new Livro(3, "Harry Potter e o Prisioneiro de Azkaban", "J.K. Rowling", 1999));
livroDAO.create(new Livro(4, "Harry Potter e o Cálice de Fogo", "J.K. Rowling", 2000));
livroDAO.create(new Livro(5, "Harry Potter e a Ordem da Fênix", "J.K. Rowling", 2003));
livroDAO.create(new Livro(6, "Harry Potter e o Enigma do Príncipe", "J.K. Rowling", 2005));
livroDAO.create(new Livro(7, "Harry Potter e as Relíquias da Morte", "J.K. Rowling", 2007));

app.get("/v3/livros", (req, res) => {
  livroDAO.findAll().then(livros => {
    res.json({ livros: livros });
  });
});

app.get("/v3/livros/:id", (req, res) => {
  const { id } = req.params;
  livroDAO.findById(id).then(livro => {
    res.json({ livro: livro });
  });
});

app.post("/v3/livros", (req, res) => {
  const { nome, autor, ano } = req.body;
  livroDAO.create(new Livro(nome, autor, ano)).then(livro => {
    res.json({ livro: livro });
  });
});

app.put("/v3/livros/:id", (req, res) => {
  const { id } = req.params;
  const { nome, autor, ano } = req.body;
  livroDAO.update(new Livro(id, nome, autor, ano)).then(livro => {
    res.json({ livro: livro });
  });
});

app.delete("/v3/livros/:id", (req, res) => {
  const { id } = req.params;
  livroDAO.delete(id).then(livro => {
    res.json({ livro: livro });
  });
});

module.exports = app;
