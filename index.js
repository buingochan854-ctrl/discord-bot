require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes
} = require('discord.js');
const axios = require('axios');

// ===== ENV =====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ===== CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== SLASH COMMAND =====
const commands = [
    new SlashCommandBuilder()
        .setName('taivideo')
        .setDescription('Tải video TikTok / YouTube')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Nhập Link Video Youtube / Tiktok')
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

// ===== REGISTER =====
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Đang đăng ký lệnh...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Đăng ký thành công');
    } catch (err) {
        console.error(err);
    }
})();

// ===== READY =====
client.once('clientReady', () => {
    console.log(`🤖 Bot Online: ${client.user.tag}`);
});

// ===== HANDLE COMMAND =====
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'taivideo') {
        const url = interaction.options.getString('link');

        await interaction.reply('⏳ Đang xử lý video...');

        try {
            let videoUrl = null;

            // =========================
            // 🔥 TIKTOK API 1
            // =========================
            try {
                const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
                videoUrl = res.data?.data?.play;
                console.log("API1:", videoUrl);
            } catch (e) {
                console.log("API1 lỗi");
            }

            // =========================
            // 🔥 TIKTOK API 2 (fallback)
            // =========================
            if (!videoUrl && url.includes('tiktok.com')) {
                try {
                    const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
                    videoUrl = res.data?.video?.noWatermark;
                    console.log("API2:", videoUrl);
                } catch (e) {
                    console.log("API2 lỗi");
                }
            }

            // =========================
            // 🔥 YOUTUBE (fallback đơn giản)
            // =========================
            if (!videoUrl && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                return interaction.editReply("⚠️ YouTube hiện chưa hỗ trợ ổn định!");
            }

            // =========================
            // ❌ FAIL
            // =========================
            if (!videoUrl) {
                return interaction.editReply('❌ Không tải được video!');
            }

            // =========================
            // 🔍 CHECK SIZE
            // =========================
            let size = 0;
            try {
                const head = await axios.head(videoUrl);
                size = parseInt(head.headers['content-length'] || 0);
            } catch {
                console.log("Không check được size");
            }

            // =========================
            // ❌ QUÁ NẶNG
            // =========================
            if (size > 25 * 1024 * 1024) {
                return interaction.editReply(`❌ Video quá nặng!\n👉 Link tải: ${videoUrl}`);
            }

            // =========================
            // ✅ GỬI VIDEO
            // =========================
            await interaction.editReply({
                content: '🎬 Video đây:',
                files: [videoUrl]
            });

        } catch (err) {
            console.error("LỖI CHI TIẾT:", err.response?.data || err.message);
            interaction.editReply('❌ Lỗi khi xử lý video!');
        }
    }
});

// ===== LOGIN =====
client.login(TOKEN).catch(err => {
    console.error("❌ Login lỗi:", err);
});
