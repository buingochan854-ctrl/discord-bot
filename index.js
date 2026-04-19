require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes
} = require('discord.js');
const axios = require('axios');

// ===== CONFIG =====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPO;
const FILE = "keys.json";

const OWNER_ID = "1455796719378895022";

// ===== CACHE =====
let cache = {};
let cacheSHA = null;
let lastFetch = 0;

// =======================
// 📥 LOAD KEYS (ANTI CRASH)
// =======================
async function loadKeys() {
    try {
        // cache 10 giây
        if (Date.now() - lastFetch < 10000) {
            return { data: cache, sha: cacheSHA };
        }

        const res = await axios.get(
            `https://api.github.com/repos/${REPO}/contents/${FILE}`,
            {
                headers: { Authorization: `token ${GITHUB_TOKEN}` }
            }
        );

        let content = "";

        try {
            content = Buffer.from(res.data.content, 'base64').toString();
            cache = JSON.parse(content);
        } catch {
            console.log("⚠️ JSON lỗi → reset file");
            cache = {};
        }

        cacheSHA = res.data.sha;
        lastFetch = Date.now();

        return { data: cache, sha: cacheSHA };

    } catch (err) {
        console.log("⚠️ GitHub lỗi → dùng cache");
        return { data: cache, sha: cacheSHA };
    }
}

// =======================
// 💾 SAVE KEYS (ANTI CRASH)
// =======================
async function saveKeys(data, sha) {
    try {
        cache = data;

        const content = Buffer.from(
            JSON.stringify(data, null, 2)
        ).toString('base64');

        await axios.put(
            `https://api.github.com/repos/${REPO}/contents/${FILE}`,
            {
                message: "update keys",
                content,
                sha: sha || undefined
            },
            {
                headers: { Authorization: `token ${GITHUB_TOKEN}` }
            }
        );

    } catch (err) {
        console.log("❌ Save lỗi nhưng bot vẫn sống");
    }
}

// =======================
// 🤖 CLIENT
// =======================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =======================
// 📌 COMMANDS
// =======================
const commands = [

    new SlashCommandBuilder()
        .setName('addkey')
        .setDescription('Thêm key')
        .addStringOption(o =>
            o.setName('name').setDescription('Tên key').setRequired(true))
        .addStringOption(o =>
            o.setName('value').setDescription('Value').setRequired(true))
        .addIntegerOption(o =>
            o.setName('time').setDescription('Phút').setRequired(false)),

    new SlashCommandBuilder()
        .setName('delkey')
        .setDescription('Xoá key')
        .addStringOption(o =>
            o.setName('name').setDescription('Tên key').setRequired(true)),

    new SlashCommandBuilder()
        .setName('taivideo')
        .setDescription('Tải video')
        .addStringOption(o =>
            o.setName('link').setDescription('Link video').setRequired(true))

].map(c => c.toJSON());

// =======================
// 📌 REGISTER
// =======================
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log("✅ Slash OK");
    } catch {
        console.log("❌ Register lỗi nhưng bot vẫn chạy");
    }
})();

// =======================
// READY
// =======================
client.once('clientReady', () => {
    console.log("🤖 Bot Online");
});

// =======================
// COMMAND HANDLER
// =======================
client.on('interactionCreate', async (i) => {
    if (!i.isChatInputCommand()) return;

    try {

        // ===== ADD KEY =====
        if (i.commandName === 'addkey') {

            if (i.user.id !== OWNER_ID)
                return i.reply({ content: '❌ Không có quyền', ephemeral: true });

            const name = i.options.getString('name').toLowerCase();
            const value = i.options.getString('value');
            const time = i.options.getInteger('time');

            let expire = null;
            if (time) expire = Date.now() + time * 60000;

            const { data, sha } = await loadKeys();

            data[name] = { value, expire };

            await saveKeys(data, sha);

            return i.reply('✅ Add Key Successful');
        }

        // ===== DELETE =====
        if (i.commandName === 'delkey') {

            if (i.user.id !== OWNER_ID)
                return i.reply({ content: '❌ Không có quyền', ephemeral: true });

            const name = i.options.getString('name').toLowerCase();

            const { data, sha } = await loadKeys();

            delete data[name];

            await saveKeys(data, sha);

            return i.reply('🗑️ Đã xoá');
        }

        // ===== VIDEO =====
        if (i.commandName === 'taivideo') {

            const url = i.options.getString('link');

            await i.reply('⏳ Đang xử lý...');

            try {
                const api = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);

                const videoUrl = api.data?.data?.play;

                if (!videoUrl)
                    return i.editReply('❌ Không lấy được video');

                const video = await axios.get(videoUrl, { responseType: 'arraybuffer' });

                const size = video.data.length / 1024 / 1024;

                if (size > 25)
                    return i.editReply(`❌ Video quá nặng (${size.toFixed(2)}MB)\n👉 ${videoUrl}`);

                await i.editReply({
                    files: [{
                        attachment: Buffer.from(video.data),
                        name: 'video.mp4'
                    }]
                });

            } catch {
                i.editReply('❌ Lỗi xử lý video');
            }
        }

    } catch (err) {
        console.log("❌ Lỗi nhưng bot không crash");
    }
});

// =======================
// MESSAGE CHECK KEY
// =======================
client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    try {
        const text = msg.content.toLowerCase();

        const { data } = await loadKeys();

        const key = data[text];

        if (!key) return;

        if (key.expire && Date.now() > key.expire) return;

        msg.reply(`🔑 ${key.value}`);

    } catch {
        console.log("⚠️ Lỗi message nhưng bot vẫn sống");
    }
});

// =======================
// LOGIN
// =======================
client.login(TOKEN).catch(() => {
    console.log("❌ Token lỗi nhưng bot không crash");
});
