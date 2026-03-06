import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("lanchonete.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    items TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial data
db.prepare("DELETE FROM products").run();
const insert = db.prepare("INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)");

// Sanduíches
insert.run("Misto Quente", "Presunto e Queijo", 15.00, "Sanduíches", "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?w=500&q=80");
insert.run("Bauru", "Presunto, queijo, tomate, alface", 19.00, "Sanduíches", "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=500&q=80");
insert.run("Americano", "Presunto, queijo, tomate, ovo e alface", 20.00, "Sanduíches", "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80");

// Hambúrgueres
insert.run("X Burguer", "Carne, queijo e tomate", 20.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("X Burguer Egg", "Carne, queijo, tomate e ovo", 24.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("X Salada", "Carne, queijo, tomate e alface", 22.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("Presburguer", "Carne, queijo, presunto, tomate e alface", 23.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("Presburguer Egg", "Carne, queijo, presunto, tomate, alface e ovo", 26.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("X Bacon", "Carne, queijo, tomate e bacon", 24.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("X Salada Egg", "Carne, queijo, tomate, alface e ovo", 25.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("X Bacon Egg", "Carne, queijo, tomate, bacon e ovo", 27.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("X Salada Bacon", "Carne, queijo, bacon, tomate e alface", 28.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("X Salada Bacon Egg", "Carne, queijo, bacon, tomate, alface e ovo", 29.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");
insert.run("X Tudo", "Carne, queijo, ovo, tomate, alface, bacon e presunto", 30.00, "Hambúrgueres", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");

// Frango
insert.run("Frango Simples", "Bife, tomate e alface", 23.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");
insert.run("Frango Salada", "Bife, queijo, tomate e alface", 25.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");
insert.run("Frango Egg", "Bife, queijo, ovo e tomate", 27.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");
insert.run("Frango Bacon", "Bife, queijo, tomate e bacon", 28.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");
insert.run("Frango Salada Egg", "Bife, queijo, tomate, alface e ovo", 29.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");
insert.run("Frango Bacon Egg", "Bife, queijo, tomate, bacon e ovo", 30.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");
insert.run("Frango Salada Bacon Egg", "Bife, queijo, tomate, bacon, ovo e alface", 30.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");
insert.run("Frango Tudo", "Bife, queijo, tomate, bacon, ovo, alface e presunto", 34.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");
insert.run("Especial 2 Carnes (Frango)", "filé de frango, queijo, hambúguer, bacon, tomate, alface, ovo e presunto", 42.00, "Frango", "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&q=80");

// Lombo
insert.run("Lombo Simples", "Bife, tomate e alface", 23.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");
insert.run("Lombo Salada", "Bife, queijo, tomate e alface", 25.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");
insert.run("Lombo Egg", "Bife, queijo, ovo e tomate", 27.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");
insert.run("Lombo Bacon", "Bife, queijo, tomate e bacon", 28.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");
insert.run("Lombo Salada Egg", "Bife, queijo, tomate, alface e ovo", 30.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");
insert.run("Lombo Bacon Egg", "Bife, queijo, tomate, bacon e ovo", 30.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");
insert.run("Lombo Salada Bacon Egg", "Bife, queijo, tomate, bacon, ovo e alface", 32.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");
insert.run("Lombo Tudo", "Bife, queijo, tomate, bacon, ovo, alface e presunto", 34.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");
insert.run("Especial 2 Carnes (Lombo)", "bife, queijo, hambúguer, bacon, tomate, alface, ovo e presunto", 42.00, "Lombo", "https://images.unsplash.com/photo-1544022613-e87ce71c8599?w=500&q=80");

// Filé Mignon
insert.run("Filé Simples", "Bife, tomate e alface", 33.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Filé Salada", "Bife, queijo, tomate e alface", 35.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Filé Egg", "Bife, queijo, ovo e tomate", 37.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Filé Bacon", "Bife, queijo, tomate e bacon", 39.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Filé Salada Egg", "Bife, queijo, tomate, alface e ovo", 40.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Filé Bacon Egg", "Bife, queijo, tomate, bacon e ovo", 41.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Filé Salada Bacon", "Bife, queijo, tomate, bacon e alface", 40.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Filé Salada Bacon Egg", "Bife, queijo, bacon, tomate, alface e ovo", 43.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Filé Tudo", "Bife, queijo, tomate, bacon, ovo, alface e presunto", 45.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");
insert.run("Especial 2 Carnes (Filé)", "filé, queijo, hambúguer, bacon, tomate, alface, ovo e presunto", 52.00, "Filé Mignon", "https://images.unsplash.com/photo-1558030006-450675393462?w=500&q=80");

// Bebidas
insert.run("Refrigerante Lata", "Lata 350ml", 7.00, "Bebidas", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80");
insert.run("Refrigerante 2L", "Garrafa 2 Litros", 16.00, "Bebidas", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80");
insert.run("Água", "Garrafa 500ml", 5.00, "Bebidas", "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=500&q=80");
insert.run("Cerveja Lata Skol/Brahma", "Lata 350ml", 7.00, "Bebidas", "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?w=500&q=80");
insert.run("Cerveja Lata Heineken", "Lata 350ml", 10.00, "Bebidas", "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=500&q=80");
insert.run("Refrigerante 1L", "Garrafa 1 Litro", 10.00, "Bebidas", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80");
insert.run("Suco", "Copo 500ml", 10.00, "Bebidas", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80");


async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, description, price, category, image } = req.body;
    const info = db.prepare("INSERT INTO products (name, description, price, category, image) VALUES (?, ?, ?, ?, ?)")
      .run(name, description, price, category, image);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items as string) })));
  });

  app.post("/api/orders", (req, res) => {
    const { customer_name, customer_phone, address, notes, total, items } = req.body;
    const info = db.prepare("INSERT INTO orders (customer_name, customer_phone, address, notes, total, items) VALUES (?, ?, ?, ?, ?, ?)")
      .run(customer_name, customer_phone, address, notes, total, JSON.stringify(items));
    
    const newOrder = { 
      id: info.lastInsertRowid, 
      customer_name, 
      customer_phone, 
      address, 
      notes,
      total, 
      items, 
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    io.emit("new_order", newOrder);
    res.json(newOrder);
  });

  app.patch("/api/orders/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    io.emit("order_updated", { id: req.params.id, status });
    res.json({ success: true });
  });

  // Socket.io
  io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
