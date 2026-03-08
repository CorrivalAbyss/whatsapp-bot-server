// index.js
const express = require("express");
const cors = require("cors");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();
app.use(cors());
app.use(express.json());

// Configuración del cliente de WhatsApp para deploy en Railway
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "bot", dataPath: "./wwebjs_auth" }),
    puppeteer: {
        headless: true, // Headless obligatorio para Railway
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

// Evento QR (solo aparece localmente si no hay sesión)
client.on("qr", (qr) => {
    console.log("Escanea este QR 👇 (solo si no hay sesión guardada)");
    qrcode.generate(qr, { small: true });
});

// Evento cuando el bot está listo
client.on("ready", () => {
    console.log("WhatsApp conectado ✅");
});

// Inicializamos el cliente
client.initialize();

// --- API REST ---

// Estado del bot
app.get("/status", (req, res) => {
    res.json({ ready: client.info && client.info.wid ? true : false });
});

// Enviar mensaje de prueba
app.post("/send", async (req, res) => {
    try {
        const { phone, message } = req.body;
        const chatId = `${phone}@c.us`;
        const sent = await client.sendMessage(chatId, message);
        res.json({ success: true, id: sent.id._serialized });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Campaña: enviar mensajes a varios contactos
app.post("/campaigns", async (req, res) => {
    try {
        const { contacts, message } = req.body;
        const results = [];
        for (let phone of contacts) {
            try {
                const chatId = `${phone}@c.us`;
                const sent = await client.sendMessage(chatId, message);
                results.push({ phone, success: true, id: sent.id._serialized });
            } catch (err) {
                results.push({ phone, success: false, error: err.message });
            }
        }
        res.json({ success: true, results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Arrancamos el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado 🚀 en puerto ${PORT}`);
});
