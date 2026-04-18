require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes
} = require('discord.js');
const axios = require('axios');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== COMMAND =====
const commands = [
    new SlashCommandBuilder()
        .setName('taivideo')
        .setDescription('Tải video TikTok')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Nhập link TikTok')
                .setRequired(true)
        )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// ===== REGISTER =====
(async () => {
    await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
    );
    console.log("✅ Slash command OK");
})();

// ===== READY =====
client.once('clientReady', () => {
    console.log(`🤖 Online: ${client.user.tag}`);
});

// ===== HANDLE =====
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'taivideo') {
        const url = interaction.options.getString('link');

        await interaction.reply('⏳ Đang xử lý video...');

        try {
            // ===== LẤY VIDEO =====
            const api = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const videoUrl = api.data?.data?.play;

            if (!videoUrl) {
                return interaction.editReply('❌ Không lấy được video!');
            }

            // ===== TẢI VIDEO =====
            const videoRes = await axios.get(videoUrl, {
                responseType: 'arraybuffer'
            });

            const sizeMB = videoRes.data.length / 1024 / 1024;

            // ===== QUÁ NẶNG =====
            if (sizeMB > 25) {
                return interaction.editReply(`❌ Video quá nặng (${sizeMB.toFixed(2)}MB)\n👉 ${videoUrl}`);
            }

            // ===== GỬI FILE =====
            await interaction.editReply({
                content: '🎬 Video đây:',
                files: [{
                    attachment: Buffer.from(videoRes.data),
                    name: 'video.mp4'
                }]
            });

        } catch (err) {
            console.error("LỖI:", err.message);
            interaction.editReply('❌ Lỗi khi xử lý video!');
        }
    }
});

client.login(TOKEN);
