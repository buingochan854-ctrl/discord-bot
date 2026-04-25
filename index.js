require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require('discord.js');

const axios = require('axios');
const express = require('express');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const OWNER_ID = process.env.OWNER_ID;

// ===== ANTI CRASH =====
process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);

// ===== KEY CACHE =====
let keyCache = {};
let cacheSHA = "";

// ===== LOAD KEYS =====
async function loadKeys() {
    try {
        const res = await axios.get(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/keys.json`,
            { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );

        keyCache = JSON.parse(Buffer.from(res.data.content, 'base64').toString());
        cacheSHA = res.data.sha;

    } catch (err) {
        console.log("Load key lỗi:", err.message);
    }
}

// ===== SAVE KEYS =====
async function saveKeys() {
    const content = Buffer.from(JSON.stringify(keyCache, null, 2)).toString('base64');

    await axios.put(
        `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/keys.json`,
        {
            message: "update key",
            content,
            sha: cacheSHA
        },
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
    );
}

// ===== COMMAND =====
const commands = [
    {
        name: "addkey",
        description: "Thêm key",
        options: [
            { name: "name", description: "Tên key", type: 3, required: true },
            { name: "value", description: "Value", type: 3, required: true }
        ]
    },
    { name: "deletekey", description: "Xoá key" },
    { name: "status", description: "Xem trạng thái bot" }
];

// ===== REGISTER =====
async function registerAll() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    for (const g of client.guilds.cache.map(g => g.id)) {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, g),
            { body: commands }
        );
    }
}

// ===== STATUS UI =====
function buildStatus() {

    const keys = Object.keys(keyCache).length;
    const guilds = client.guilds.cache.size;

    const ping = client.ws.ping;

    const up = Math.floor(process.uptime());
    const h = Math.floor(up / 3600);
    const m = Math.floor((up % 3600) / 60);

    return new EmbedBuilder()
        .setColor("Green")
        .setTitle("🇻🇳 VIETNAM APP DISCORD")
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
            { name: "📊 TRẠNG THÁI", value: "🟢 HOẠT ĐỘNG" },
            { name: "👑 OWNER", value: `<@${OWNER_ID}>` },
            { name: "🔑 KEYS", value: `${keys}`, inline: true },
            { name: "🌐 MÁY CHỦ", value: `${guilds}`, inline: true },
            { name: "⚡ PING", value: `${ping}ms`, inline: true },
            { name: "⏳ UPTIME", value: `${h}h ${m}m`, inline: true }
        )
        .setFooter({
            text: "🇻🇳 CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM | ĐỘC LẬP - TỰ DO - HẠNH PHÚC"
        });
}

// ===== READY =====
client.once('clientReady', async () => {
    console.log("🔥 ONLINE 24/7 PRO");

    await loadKeys();
    await registerAll();
});

// ===== INTERACTION =====
client.on('interactionCreate', async i => {

    if (i.isChatInputCommand()) {

        if (i.commandName === "status") {

            const btn = new ButtonBuilder()
                .setCustomId("refresh")
                .setLabel("🔄 Refresh")
                .setStyle(ButtonStyle.Primary);

            return i.reply({
                embeds: [buildStatus()],
                components: [new ActionRowBuilder().addComponents(btn)],
                ephemeral: true
            });
        }

        if (i.commandName === "addkey") {

            if (i.user.id !== OWNER_ID)
                return i.reply({ content: "❌ Không có quyền", ephemeral: true });

            const name = i.options.getString('name').toLowerCase();
            const value = i.options.getString('value');

            keyCache[name] = { value };
            await saveKeys();

            return i.reply("✅ Add Key Successful");
        }

        if (i.commandName === "deletekey") {

            const menu = new StringSelectMenuBuilder()
                .setCustomId("del")
                .addOptions(Object.keys(keyCache).map(k => ({ label: k, value: k })));

            return i.reply({
                content: "Chọn key",
                components: [new ActionRowBuilder().addComponents(menu)],
                ephemeral: true
            });
        }
    }

    if (i.isButton() && i.customId === "refresh") {
        return i.update({ embeds: [buildStatus()] });
    }

    if (i.isStringSelectMenu()) {
        delete keyCache[i.values[0]];
        await saveKeys();
        i.update({ content: "✅ Đã xoá", components: [] });
    }
});

// ===== EXPRESS (UPTIME) =====
const app = express();

app.get('/', (req, res) => res.send("🤖 Bot Alive"));
app.get('/ping', (req, res) => res.json({ uptime: process.uptime() }));
app.get('/heavy', (req, res) => {
    let x = 0;
    for (let i = 0; i < 1e6; i++) x += i;
    res.send("ok");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Port ${PORT}`));

// ===== LOGIN =====
client.login(process.env.TOKEN);
