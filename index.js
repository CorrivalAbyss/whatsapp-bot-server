const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false
    }
});

client.on("qr", qr => {
    console.log("Escanea este QR 👇");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("WhatsApp conectado ✅");
});

client.initialize();

app.listen(3000, () => {
    console.log("Servidor iniciado 🚀");
});