const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { exec } = require("child_process");
const fs = require("fs");

console.log("👉 Đang login...");
console.log("🔑 TOKEN LENGTH:", process.env.TOKEN?.length);

// ====== TẠO BOT ======
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ====== TẠO LỆNH /taivideo ======
const commands = [
  new SlashCommandBuilder()
    .setName('taivideo')
    .setDescription('Tải Video Youtube Hoặc Tiktok')
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Nhập link Youtube hoặc Tiktok')
        .setRequired(true))
];

// ====== ĐĂNG KÝ LỆNH ======
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("✅ Đã đăng ký lệnh /taivideo");
  } catch (err) {
    console.error(err);
  }
});

// ====== XỬ LÝ LỆNH ======
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'taivideo') {
    const url = interaction.options.getString('link');

    // Bước 1: báo đang tải
    await interaction.reply("⏳ Đang tải video...");

    const file = `video_${Date.now()}.mp4`;

    // Bước 2: tải video
    exec(`yt-dlp -o "${file}" "${url}"`, async (err) => {
      if (err) {
        return interaction.editReply("❌ Không tải được video!");
      }

      try {
        // Bước 3: gửi video
        await interaction.editReply({
          content: "🎬 Video của bạn:",
          files: [file]
        });
      } catch (e) {
        await interaction.editReply("❌ Video quá nặng hoặc lỗi!");
      }

      // Xóa file sau khi gửi
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  }
});

// ====== LOGIN ======
client.login(process.env.TOKEN).catch(err => {
  console.error("❌ Lỗi login:", err);
});
