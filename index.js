const express = require("express");
const cors = require("cors");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on("ready", () => {
    console.log("WhatsApp conectado ✅");
});

client.on("auth_failure", msg => {
    console.error("Error de autenticación:", msg);
});

client.initialize();

app.get("/status", (req, res) => {
    res.json({ status: client.info ? "connected" : "disconnected" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor iniciado en puerto ${process.env.PORT || 3000} 🚀`);
});
