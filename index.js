require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require('discord.js');

const axios = require('axios');

const OWNER_ID = "1455796719378895022";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// ===== ANTI CRASH =====
process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);

// ===== CACHE =====
let keyCache = {};
let cacheSHA = "";

// ===== LOAD KEYS =====
async function loadKeys() {
    try {
        const res = await axios.get(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/keys.json`,
            { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );

        const content = Buffer.from(res.data.content, 'base64').toString();
        keyCache = JSON.parse(content);
        cacheSHA = res.data.sha;

        return keyCache;
    } catch (err) {
        console.log("Load key lỗi:", err.message);
        return keyCache;
    }
}

// ===== SAVE KEYS =====
async function saveKeys() {
    try {
        const content = Buffer.from(JSON.stringify(keyCache, null, 2)).toString('base64');

        await axios.put(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/keys.json`,
            {
                message: "update keys",
                content,
                sha: cacheSHA
            },
            { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );
    } catch (err) {
        console.log("Save key lỗi:", err.message);
    }
}

// ===== VIDEO API =====
async function getVideo(url) {

    try {
        const res = await axios.get(`https://api.tiklydown.me/api/download?url=${url}`);
        if (res.data.video?.noWatermark) return res.data.video.noWatermark;
    } catch {}

    try {
        const res = await axios.get(`https://api.savetube.me/video?url=${url}`);
        if (res.data.data?.download) return res.data.data.download;
    } catch {}

    return null;
}

// ===== READY =====
client.once('clientReady', async () => {
    console.log("🔥 V8 PRO MAX ONLINE");

    await loadKeys();

    const commands = [
        new SlashCommandBuilder()
            .setName('addkey')
            .setDescription('Thêm key')
            .addStringOption(o => o.setName('name').setRequired(true))
            .addStringOption(o => o.setName('value').setRequired(true)),

        new SlashCommandBuilder()
            .setName('deletekey')
            .setDescription('Xoá key'),

        new SlashCommandBuilder()
            .setName('taivideo')
            .setDescription('Tải video')
            .addStringOption(o => o.setName('url').setRequired(true)),

        new SlashCommandBuilder()
            .setName('status')
            .setDescription('Check trạng thái bot')
    ].map(c => c.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
    );
});

// ===== COMMAND =====
client.on('interactionCreate', async (i) => {

    if (i.isChatInputCommand()) {

        // ===== STATUS =====
        if (i.commandName === 'status') {
            return i.reply(`🟢 Bot Online\nKeys: ${Object.keys(keyCache).length}`);
        }

        // ===== ADD KEY =====
        if (i.commandName === 'addkey') {

            if (i.user.id !== OWNER_ID)
                return i.reply({ content: "❌ Không có quyền!", ephemeral: true });

            const name = i.options.getString('name').toLowerCase();
            const value = i.options.getString('value');

            keyCache[name] = { value };

            await saveKeys();

            return i.reply("✅ Add Key Successful");
        }

        // ===== DELETE KEY =====
        if (i.commandName === 'deletekey') {

            if (i.user.id !== OWNER_ID)
                return i.reply({ content: "❌ Không có quyền!", ephemeral: true });

            const menu = new StringSelectMenuBuilder()
                .setCustomId('delete_key')
                .setPlaceholder('Chọn key')
                .addOptions(
                    Object.keys(keyCache).map(k => ({
                        label: k,
                        value: k
                    }))
                );

            const row = new ActionRowBuilder().addComponents(menu);

            return i.reply({
                content: "🗑 Chọn key:",
                components: [row],
                ephemeral: true
            });
        }

        // ===== TAIVIDEO =====
        if (i.commandName === 'taivideo') {

            const url = i.options.getString('url');

            await i.reply("⏳ Đang xử lý video...");

            const video = await getVideo(url);

            if (!video)
                return i.editReply("❌ Không tải được video!");

            try {
                await i.editReply({
                    content: "🎬 Video:",
                    files: [video]
                });
            } catch {
                i.editReply(`⚠️ Video quá nặng!\n👉 ${video}`);
            }
        }
    }

    // ===== DELETE MENU =====
    if (i.isStringSelectMenu()) {

        const key = i.values[0];

        delete keyCache[key];
        await saveKeys();

        i.update({ content: `✅ Đã xoá ${key}`, components: [] });
    }

    // ===== COPY KEY =====
    if (i.isButton()) {

        const key = i.customId.replace("copy_", "");

        return i.reply({
            content: keyCache[key]?.value || "Không tồn tại",
            ephemeral: true
        });
    }
});

// ===== KEY MESSAGE =====
client.on('messageCreate', async (msg) => {

    if (msg.author.bot) return;

    const key = msg.content.toLowerCase();

    if (keyCache[key]) {

        const embed = new EmbedBuilder()
            .setTitle(`🔑 ${key}`)
            .setDescription(`\`\`\`${keyCache[key].value}\`\`\``)
            .setColor("Green");

        const btn = new ButtonBuilder()
            .setCustomId(`copy_${key}`)
            .setLabel("📱 Copy")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(btn);

        msg.reply({
            embeds: [embed],
            components: [row]
        });
    }
});

// ===== LOGIN =====
client.login(process.env.TOKEN); 
