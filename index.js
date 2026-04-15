require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const axios = require("axios");

// ===== ENV =====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ===== CHECK TOKEN =====
console.log(">>>TOKEN START<<<");
console.log(process.env.TOKEN);
console.log(">>>TOKEN END<<<");
console.log("LENGTH:", process.env.TOKEN?.length);

// ===== BOT =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== COMMANDS =====
const commands = [
  new SlashCommandBuilder()
    .setName("taivideo")
    .setDescription("Tải Video Youtube hoặc Tiktok")
    .addStringOption(option =>
      option
        .setName("link")
        .setDescription("Nhập link Youtube hoặc Tiktok")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("meme")
    .setDescription("Random meme 😂")
].map(cmd => cmd.toJSON());

// ===== REGISTER COMMAND =====
if (CLIENT_ID) {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  (async () => {
    try {
      console.log("🔄 Đang đăng ký lệnh...");
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log("✅ Đã đăng ký lệnh!");
    } catch (err) {
      console.error("❌ Lỗi đăng ký lệnh:", err);
    }
  })();
} else {
  console.log("⚠️ Chưa có CLIENT_ID → bỏ qua slash command");
}

// ===== READY =====
client.once("ready", () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
});

// ===== HANDLE COMMAND =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // ===== TAIVIDEO =====
  if (interaction.commandName === "taivideo") {
    const link = interaction.options.getString("link");

    await interaction.reply("⏳ Đang tải video...");

    try {
      const api = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(link)}`;
      const res = await axios.get(api);

      if (!res.data || !res.data.video) {
        return interaction.editReply("❌ Không tải được video!");
      }

      await interaction.editReply({
        content: "✅ Video của bạn:",
        files: [res.data.video]
      });

    } catch (err) {
      console.log(err);
      interaction.editReply("❌ Lỗi tải video!");
    }
  }

  // ===== MEME =====
  if (interaction.commandName === "meme") {
    try {
      const res = await axios.get("https://meme-api.com/gimme");

      await interaction.reply({
        content: res.data.title,
        files: [res.data.url]
      });

    } catch {
      interaction.reply("❌ Không lấy được meme!");
    }
  }
});

// ===== LOGIN =====
client.login(TOKEN).catch(err => {
  console.error("❌ LOGIN LỖI:", err);
});
