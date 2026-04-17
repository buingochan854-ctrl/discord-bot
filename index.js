require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes
} = require('discord.js');
const axios = require('axios');

// ====== ENV ======
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ====== CLIENT ======
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ====== REGISTER SLASH COMMAND ======
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

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Đang đăng ký slash command...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Đã đăng ký slash command!');
    } catch (err) {
        console.error(err);
    }
})();

// ====== READY ======
client.once('clientReady', () => {
    console.log(`✅ Bot online: ${client.user.tag}`);
});

// ====== INTERACTION ======
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'taivideo') {
        const url = interaction.options.getString('link');

        await interaction.reply('⏳ Đang xử lý video...');

        try {
            let videoUrl = null;

            // ===== TikTok =====
            if (url.includes('tiktok.com')) {
                const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
                videoUrl = res.data?.data?.play;
            }

            // ===== YouTube (demo API free) =====
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const res = await axios.get(`https://api.vevioz.com/api/button/mp4/720/${url}`);
                // API này trả HTML → lấy link video
                const match = res.data.match(/href="(https:[^"]+)"/);
                if (match) videoUrl = match[1];
            }

            if (!videoUrl) {
                return interaction.editReply('❌ Không tải được video!');
            }

            // ===== CHECK SIZE =====
            const head = await axios.head(videoUrl);
            const size = parseInt(head.headers['content-length'] || 0);

            if (size > 25 * 1024 * 1024) {
                return interaction.editReply('❌ Video quá nặng!');
            }

            // ===== SEND VIDEO =====
            await interaction.editReply({
                content: '🎬 Video đây:',
                files: [videoUrl]
            });

        } catch (err) {
            console.error(err);
            interaction.editReply('❌ Lỗi khi xử lý video!');
        }
    }
});

// ====== LOGIN ======
client.login(TOKEN);
