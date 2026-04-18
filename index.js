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

// ===== CLIENT =====
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =======================
// 📥 LOAD KEYS
// =======================
async function loadKeys() {
    const res = await axios.get(
        `https://api.github.com/repos/${REPO}/contents/${FILE}`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    const content = Buffer.from(res.data.content, 'base64').toString();

    return {
        data: JSON.parse(content),
        sha: res.data.sha
    };
}

// =======================
// 💾 SAVE KEYS
// =======================
async function saveKeys(data, sha) {
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    await axios.put(
        `https://api.github.com/repos/${REPO}/contents/${FILE}`,
        {
            message: "update keys",
            content,
            sha
        },
        {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        }
    );
}

// =======================
// 📌 COMMANDS (FIXED)
// =======================
const commands = [

    new SlashCommandBuilder()
        .setName('addkey')
        .setDescription('Thêm key')
        .addStringOption(o =>
            o.setName('name').setDescription('Tên key').setRequired(true))
        .addStringOption(o =>
            o.setName('value').setDescription('Giá trị key').setRequired(true))
        .addIntegerOption(o =>
            o.setName('time').setDescription('Thời hạn (phút)').setRequired(false)),

    new SlashCommandBuilder()
        .setName('delkey')
        .setDescription('Xoá key')
        .addStringOption(o =>
            o.setName('name').setDescription('Tên key').setRequired(true)),

    new SlashCommandBuilder()
        .setName('listkey')
        .setDescription('Xem danh sách key'),

    new SlashCommandBuilder()
        .setName('taivideo')
        .setDescription('Tải video TikTok')
        .addStringOption(o =>
            o.setName('link').setDescription('Link video').setRequired(true))

].map(cmd => cmd.toJSON());

// =======================
// 📌 REGISTER COMMAND
// =======================
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log("🔄 Đăng ký lệnh...");
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log("✅ Đăng ký thành công");
    } catch (err) {
        console.error(err);
    }
})();

// =======================
// 🤖 READY
// =======================
client.once('clientReady', () => {
    console.log(`🤖 Bot Online: ${client.user.tag}`);
});

// =======================
// ⚙️ COMMAND HANDLER
// =======================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // ===== ADD KEY =====
    if (interaction.commandName === 'addkey') {

        if (interaction.user.id !== OWNER_ID)
            return interaction.reply({ content: '❌ Không có quyền!', ephemeral: true });

        const name = interaction.options.getString('name').toLowerCase();
        const value = interaction.options.getString('value');
        const time = interaction.options.getInteger('time');

        let expire = null;
        if (time) expire = Date.now() + time * 60000;

        const { data, sha } = await loadKeys();
        data[name] = { value, expire };

        await saveKeys(data, sha);

        interaction.reply('✅ Add Key Successful');
    }

    // ===== DELETE KEY =====
    if (interaction.commandName === 'delkey') {

        if (interaction.user.id !== OWNER_ID)
            return interaction.reply({ content: '❌ Không có quyền!', ephemeral: true });

        const name = interaction.options.getString('name').toLowerCase();

        const { data, sha } = await loadKeys();

        if (!data[name])
            return interaction.reply('❌ Key không tồn tại');

        delete data[name];

        await saveKeys(data, sha);

        interaction.reply('🗑️ Đã xoá key');
    }

    // ===== LIST KEY =====
    if (interaction.commandName === 'listkey') {

        if (interaction.user.id !== OWNER_ID)
            return interaction.reply({ content: '❌ Không có quyền!', ephemeral: true });

        const { data } = await loadKeys();

        const list = Object.keys(data);
        if (list.length === 0) return interaction.reply('❌ Không có key');

        interaction.reply(list.join(', '));
    }

    // ===== TẢI VIDEO =====
    if (interaction.commandName === 'taivideo') {

        const url = interaction.options.getString('link');

        await interaction.reply('⏳ Đang xử lý video...');

        try {
            const api = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const videoUrl = api.data?.data?.play;

            if (!videoUrl)
                return interaction.editReply('❌ Không lấy được video');

            const video = await axios.get(videoUrl, {
                responseType: 'arraybuffer'
            });

            const sizeMB = video.data.length / 1024 / 1024;

            if (sizeMB > 25)
                return interaction.editReply(`❌ Video quá nặng (${sizeMB.toFixed(2)}MB)\n👉 ${videoUrl}`);

            await interaction.editReply({
                files: [{
                    attachment: Buffer.from(video.data),
                    name: 'video.mp4'
                }]
            });

        } catch (err) {
            console.error(err);
            interaction.editReply('❌ Lỗi khi xử lý video');
        }
    }
});

// =======================
// 💬 MESSAGE CHECK KEY
// =======================
client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    const text = msg.content.toLowerCase();

    const { data } = await loadKeys();

    const key = data[text];
    if (!key) return;

    if (key.expire && Date.now() > key.expire) return;

    msg.reply(`🔑 ${key.value}`);
});

// =======================
// 🔑 LOGIN
// =======================
client.login(TOKEN);
