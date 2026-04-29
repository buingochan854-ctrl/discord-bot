 require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const OWNER_ID = process.env.OWNER_ID;

// ===== DATA =====
let keyCache = {};
let logCache = [];

let keySHA = "";
let logSHA = "";

const userUI = new Map();

// ===== ANTI CRASH =====
process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);

// ===== GITHUB LOAD =====
async function loadFile(file) {
    const res = await axios.get(
        `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${file}`,
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
    );

    return {
        data: JSON.parse(Buffer.from(res.data.content, 'base64').toString()),
        sha: res.data.sha
    };
}

// ===== SAVE =====
async function saveFile(file, content, sha) {
    const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

    await axios.put(
        `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${file}`,
        {
            message: "update data",
            content: encoded,
            sha
        },
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
    );
}

// ===== LOAD ALL =====
async function loadAll() {
    const keys = await loadFile("keys.json");
    keyCache = keys.data;
    keySHA = keys.sha;

    const logs = await loadFile("logs.json");
    logCache = logs.data;
    logSHA = logs.sha;
}

// ===== SAVE =====
async function saveKeys() {
    await saveFile("keys.json", keyCache, keySHA);
}

async function saveLogs() {
    await saveFile("logs.json", logCache, logSHA);
}

// ===== UI =====
function sendKeyUI(msg, keyName, keyValue) {

    const mode = userUI.get(msg.author.id) || "normal";

    if (mode === "normal") {
        return msg.reply(`🔑 ${keyName}\n\n${keyValue}`);
    }

    const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`🔑 ${keyName}`)
        .setDescription(`\`\`\`\n${keyValue}\n\`\`\``);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("copy")
            .setLabel("📋 Copy")
            .setStyle(ButtonStyle.Success)
    );

    return msg.reply({ embeds: [embed], components: [row] });
}

// ===== AUTO KEY =====
client.on('messageCreate', async (msg) => {

    if (msg.author.bot) return;

    const content = msg.content.toLowerCase().trim();

    if (content.length > 50) return;

    let found = null;

    for (const key in keyCache) {
        if (content === key || content.includes(key)) {
            found = key;
            break;
        }
    }

    if (!found) return;

    const value = keyCache[found];

    // ===== LOG =====
    logCache.push({
        user: msg.author.tag,
        id: msg.author.id,
        key: found,
        time: new Date().toLocaleString(),
        type: "USE"
    });

    await saveLogs();

    return sendKeyUI(msg, found, value);
});

// ===== COMMAND =====
const commands = [
    {
        name: "addkey",
        description: "Thêm key",
        options: [
            { name: "name", type: 3, required: true },
            { name: "value", type: 3, required: true }
        ]
    },
    { name: "loguserkey", description: "Xem log" }
];

// ===== REGISTER =====
async function register() {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    );
}

// ===== READY =====
client.once('clientReady', async () => {
    console.log("🔥 V3 ULTIMATE ONLINE");

    await loadAll();
    await register();
});

// ===== INTERACTION =====
client.on('interactionCreate', async (i) => {

    if (!i.isChatInputCommand()) return;

    if (i.commandName === "addkey") {

        if (i.user.id !== OWNER_ID) {
            return i.reply({ content: "❌ Không có quyền", ephemeral: true });
        }

        const name = i.options.getString('name').toLowerCase();
        const value = i.options.getString('value');

        keyCache[name] = value;

        logCache.push({
            user: i.user.tag,
            id: i.user.id,
            key: name,
            time: new Date().toLocaleString(),
            type: "ADD"
        });

        await saveKeys();
        await saveLogs();

        return i.reply({
            content: `✅ Đã thêm key: ${name}`,
            ephemeral: true
        });
    }

    if (i.commandName === "loguserkey") {

        if (i.user.id !== OWNER_ID) {
            return i.reply({ content: "❌ Không có quyền", ephemeral: true });
        }

        const text = logCache.slice(-20).map(l =>
            `👤 ${l.user}\n🔑 ${l.key}\n📌 ${l.type}\n⏰ ${l.time}\n`
        ).join("\n");

        return i.reply({
            content: `📊 LOG:\n\n${text || "Không có log"}`,
            ephemeral: true
        });
    }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
