import cors from "cors";
import express from "express";
import mysql from "mysql2/promise";
import { RowDataPacket, type ResultSetHeader } from "mysql2/promise";

interface Product extends RowDataPacket {
  id: number;
  name: string;
  cost: number;
}

// DATABASE_URL, e.g. mysql://tda_user:strongPassword%3F@127.0.0.1:3306/product
const db = mysql.createPool(process.env.DATABASE_URL!);

// The database may still be starting up (no startup order on Tour de Cloud), so retry.
for (let attempt = 1; ; attempt++) {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS product (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      cost INT NOT NULL
    )`);
    break;
  } catch (error) {
    if (attempt === 60) throw error;
    console.log("Waiting for database...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

function parseProduct(body: unknown): { name: string; cost: number } | null {
  const { name, cost } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || !Number.isInteger(cost)) return null;
  return { name, cost: cost as number };
}

const app = express();
// Allow a frontend dev server on another port (e.g. localhost:3000) to call the API.
app.use(cors());
app.use(express.json());


//tady něco píšu ↓↓↓↓↓

//endpoint pro health
app.get("/api/v1/health", async (_req, res) => {
  res.status(200).json({ status: "ok" });
});

//vykraftíme tabulku
await db.query(`CREATE TABLE IF NOT EXISTS team_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL,
  members VARCHAR(255) INT NOT NULL
  )`);

//zjistíme jestli v té tabulce už něco je
const [existing] = await db.query<Product[]>("SELECT id FROM team_info");

//pokud je tabulka prázdná tak tam vložíme naše data
if (existing.length === 0){
  await db.execute(
    "INSERT INTO team_info (team_name, members) VALUES (?, ?)",
    [
      "Ad victoriam_-_EJDŮKÁCÝJŐN_-_asdfgytdhcxg_-_&baggřistický pařez_-_#fandklubSCG",
      "Skibidi Pavel, já, Luky Selba"
    ]
  );
}


//endpoint pro tabulku team_info
app.get("/api/v1/team", async (_req, res) => {
  //první řádek z tabulky
  const [rows] = await db.query<RowDataPacket[]>("SELECT team_name, members FROM team_info LIMIT 1");
  
  res.json(rows[0]);
});




//tady něco píšu ^^^^^^

app.get("/api/product", async (_req, res) => {
  const [products] = await db.query<Product[]>("SELECT id, name, cost FROM product ORDER BY id");
  res.json(products);
});

app.post("/api/product", async (req, res) => {
  const data = parseProduct(req.body);
  if (!data) {
    res.status(400).json({ message: "name and cost are required" });
    return;
  }

  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO product (name, cost) VALUES (?, ?)",
    [data.name, data.cost],
  );
  res.json({ id: result.insertId, ...data });
});

app.put("/api/product/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [[product]] = await db.execute<Product[]>("SELECT id FROM product WHERE id = ?", [id]);
  if (!product) {
    res.status(404).json({ message: "Product does not exist" });
    return;
  }

  const data = parseProduct(req.body);
  if (!data) {
    res.status(400).json({ message: "name and cost are required" });
    return;
  }

  await db.execute("UPDATE product SET name = ?, cost = ? WHERE id = ?", [data.name, data.cost, id]);
  res.json({ id, ...data });
});

app.delete("/api/product/:id", async (req, res) => {
  await db.execute("DELETE FROM product WHERE id = ?", [Number(req.params.id)]);
  res.json({ message: "Product was deleted permanently from DB." });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
