require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes
} = require('discord.js');

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus
} = require('@discordjs/voice');

const axios = require('axios');
const play = require('play-dl');

const OWNER_ID = "1455796719378895022";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const queue = new Map();
let keyCache = {};

// ================= GLOBAL ANTI CRASH =================
process.on('uncaughtException', err => {
    console.log("🔥 Uncaught:", err.message);
});

process.on('unhandledRejection', err => {
    console.log("🔥 Promise:", err);
});

// ================= SAFE WRAPPER =================
function safe(fn) {
    return async (...args) => {
        try {
            await fn(...args);
        } catch (err) {
            console.log("⚠️ Safe Error:", err.message);
        }
    };
}

// ================= MUSIC =================
async function playMusic(guild, song, retry = 0) {
    const q = queue.get(guild.id);

    if (!song) {
        console.log("⚠️ Hết nhạc - giữ voice");
        return;
    }

    try {
        const stream = await play.stream(song.url);

        const resource = createAudioResource(stream.stream, {
            inputType: stream.type
        });

        q.player.play(resource);

        q.player.once(AudioPlayerStatus.Idle, () => {
            q.songs.shift();
            playMusic(guild, q.songs[0]);
        });

    } catch (err) {
        console.log("❌ Stream lỗi:", err.message);

        if (retry < 3) {
            return playMusic(guild, song, retry + 1);
        }

        q.songs.shift();
        playMusic(guild, q.songs[0]);
    }
}

// ================= READY =================
client.once('clientReady', async () => {
    console.log("🤖 AntiCrash V2 Online");

    try {
        const commands = [
            new SlashCommandBuilder()
                .setName('status')
                .setDescription('Xem trạng thái'),

            new SlashCommandBuilder()
                .setName('addkey')
                .setDescription('Thêm key')
                .addStringOption(o =>
                    o.setName('name')
                     .setDescription('Tên key')
                     .setRequired(true))
                .addStringOption(o =>
                    o.setName('value')
                     .setDescription('Value key')
                     .setRequired(true))
        ].map(c => c.toJSON());

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log("✅ Slash OK");

    } catch (err) {
        console.log("❌ Slash lỗi:", err.message);
    }
});

// ================= SLASH =================
client.on('interactionCreate', safe(async (i) => {

    if (!i.isChatInputCommand()) return;

    if (i.commandName === 'status') {
        return i.reply({
            content: `🟢 Online | ${client.guilds.cache.size} servers`
        });
    }

    if (i.commandName === 'addkey') {

        if (i.user.id !== OWNER_ID)
            return i.reply({ content: "❌ Không có quyền", ephemeral: true });

        const name = i.options.getString('name');
        const value = i.options.getString('value');

        keyCache[name.toLowerCase()] = { value };

        return i.reply("✅ Add Key Successful");
    }
}));

// ================= MESSAGE =================
client.on('messageCreate', safe(async (msg) => {

    if (msg.author.bot) return;

    const args = msg.content.split(' ');
    const cmd = args[0];

    // ===== KEY =====
    if (keyCache[msg.content.toLowerCase()]) {
        return msg.reply(`🔑 ${keyCache[msg.content.toLowerCase()].value}`);
    }

    // ===== PLAY =====
    if (cmd === '+play') {

        const vc = msg.member.voice.channel;
        if (!vc) return msg.reply("❌ Vào voice!");

        const query = args.slice(1).join(' ');
        if (!query) return msg.reply("❌ Nhập tên!");

        const result = await play.search(query, { limit: 1 });

        if (!result.length) return msg.reply("❌ Không tìm thấy!");

        const song = {
            title: result[0].title,
            url: result[0].url
        };

        let q = queue.get(msg.guild.id);

        if (!q) {
            q = {
                voiceChannel: vc,
                connection: null,
                player: createAudioPlayer(),
                songs: []
            };

            queue.set(msg.guild.id, q);
            q.songs.push(song);

            const connection = joinVoiceChannel({
                channelId: vc.id,
                guildId: msg.guild.id,
                adapterCreator: msg.guild.voiceAdapterCreator
            });

            q.connection = connection;
            connection.subscribe(q.player);

            playMusic(msg.guild, q.songs[0]);

        } else {
            q.songs.push(song);
        }

        msg.reply(`🎶 ${song.title}`);
    }

    // ===== TAIVIDEO =====
    if (cmd === '+taivideo') {

        const url = args[1];
        if (!url) return msg.reply("❌ Nhập link");

        msg.reply("⏳ Đang xử lý...");

        try {
            const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const video = res.data?.data?.play;

            msg.reply(video || "❌ Lỗi video");

        } catch {
            msg.reply("❌ API lỗi");
        }
    }

    // ===== SKIP =====
    if (cmd === '+skip') {
        const q = queue.get(msg.guild.id);
        if (!q) return;
        q.player.stop();
    }

    // ===== STOP =====
    if (cmd === '+stop') {
        const q = queue.get(msg.guild.id);
        if (!q) return;
        q.songs = [];
        q.player.stop();
    }
}));

// ================= LOGIN =================
client.login(process.env.TOKEN).catch(err => {
    console.log("❌ LOGIN:", err.message);
});
