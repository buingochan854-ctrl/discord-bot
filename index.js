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

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const OWNER_ID = process.env.OWNER_ID;

// ===== DATA =====
let keyCache = {};
const userUI = new Map(); // lưu UI user

// ===== ANTI CRASH =====
process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);

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
    {
        name: "getkey",
        description: "Lấy key",
        options: [
            { name: "name", type: 3, required: true }
        ]
    }
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
    console.log("🔥 UI SYSTEM ONLINE");
    await register();
});

// ===== FUNCTION HIỂN THỊ KEY =====
function sendKeyUI(i, keyName, keyValue) {

    const mode = userUI.get(i.user.id) || "normal";

    // ===== UI THƯỜNG =====
    if (mode === "normal") {
        return i.reply({
            content: `🔑 ${keyName}\n\n${keyValue}`,
            ephemeral: true
        });
    }

    // ===== UI ĐẸP =====
    const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`🔑 ${keyName}`)
        .setDescription(`\`\`\`\n${keyValue}\n\`\`\``);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("copy_pc")
            .setLabel("💻 Copy PC")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("copy_mobile")
            .setLabel("📱 Copy Mobile")
            .setStyle(ButtonStyle.Success)
    );

    return i.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    });
}

// ===== INTERACTION =====
client.on('interactionCreate', async i => {

    // ===== COMMAND =====
    if (i.isChatInputCommand()) {

        // ===== ADD KEY =====
        if (i.commandName === "addkey") {

            if (i.user.id !== OWNER_ID) {
                return i.reply({
                    content: "❌ Không có quyền",
                    ephemeral: true
                });
            }

            const name = i.options.getString('name').toLowerCase();
            const value = i.options.getString('value');

            keyCache[name] = value;

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("ui_select")
                    .setLabel("🎨 Chỉnh UI")
                    .setStyle(ButtonStyle.Primary)
            );

            return i.reply({
                content: `✅ Đã thêm key: ${name}\n👉 Chọn UI hiển thị`,
                components: [row],
                ephemeral: true
            });
        }

        // ===== GET KEY =====
        if (i.commandName === "getkey") {

            const name = i.options.getString('name').toLowerCase();

            if (!keyCache[name]) {
                return i.reply({
                    content: "❌ Không tìm thấy key",
                    ephemeral: true
                });
            }

            return sendKeyUI(i, name, keyCache[name]);
        }
    }

    // ===== BUTTON =====
    if (i.isButton()) {

        // ===== CHỌN UI =====
        if (i.customId === "ui_select") {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("ui_fancy")
                    .setLabel("✨ UI đẹp")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("ui_normal")
                    .setLabel("📄 UI thường")
                    .setStyle(ButtonStyle.Secondary)
            );

            return i.update({
                content: "Chọn giao diện:",
                components: [row]
            });
        }

        // ===== SET UI =====
        if (i.customId === "ui_fancy") {
            userUI.set(i.user.id, "fancy");

            return i.update({
                content: "✅ Đã chọn UI đẹp",
                components: []
            });
        }

        if (i.customId === "ui_normal") {
            userUI.set(i.user.id, "normal");

            return i.update({
                content: "✅ Đã chọn UI thường",
                components: []
            });
        }

        // ===== COPY =====
        if (i.customId === "copy_pc" || i.customId === "copy_mobile") {

            return i.reply({
                content: "📋 Nhấn giữ để copy!",
                ephemeral: true
            });
        }
    }
});

// ===== LOGIN =====
client.login(process.env.TOKEN); 
