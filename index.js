require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
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

// ===== CONFIG =====
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

// ================= KEY SYSTEM =================
async function loadKeys() {
    try {
        const res = await axios.get(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/keys.json`,
            { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );

        const content = Buffer.from(res.data.content, 'base64').toString();
        keyCache = JSON.parse(content);

        return { data: keyCache, sha: res.data.sha };

    } catch {
        return { data: keyCache, sha: null };
    }
}

async function saveKeys(data, sha) {
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    await axios.put(
        `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/keys.json`,
        {
            message: "update keys",
            content,
            sha
        },
        {
            headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` }
        }
    );
}

// ================= MUSIC =================
async function playMusic(guild, song, retry = 0) {
    const q = queue.get(guild.id);

    if (!song) {
        console.log("⚠️ Hết nhạc (KHÔNG thoát voice)");
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
        console.log("❌ STREAM FAIL:", err.message);

        if (retry < 3) {
            console.log(`🔁 Retry ${retry + 1}`);
            return playMusic(guild, song, retry + 1);
        }

        q.songs.shift();

        if (q.songs.length > 0) {
            playMusic(guild, q.songs[0]);
        }
    }
}

// ================= READY =================
client.once('clientReady', async () => {
    console.log("🤖 Bot Stable Online");

    const commands = [
        new SlashCommandBuilder()
            .setName('status')
            .setDescription('Xem trạng thái bot'),

        new SlashCommandBuilder()
            .setName('addkey')
            .setDescription('Thêm key')
            .addStringOption(o => o.setName('name').setRequired(true))
            .addStringOption(o => o.setName('value').setRequired(true))
    ].map(c => c.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
    );

    console.log("✅ Slash OK");
});

// ================= SLASH =================
client.on('interactionCreate', async (i) => {
    if (!i.isChatInputCommand()) return;

    // ===== STATUS =====
    if (i.commandName === 'status') {
        return i.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📊 Status")
                    .setDescription("🟢 Online")
                    .addFields(
                        { name: "Servers", value: `${client.guilds.cache.size}`, inline: true },
                        { name: "Uptime", value: `${Math.floor(process.uptime())}s`, inline: true }
                    )
            ]
        });
    }

    // ===== ADDKEY =====
    if (i.commandName === 'addkey') {

        if (i.user.id !== OWNER_ID)
            return i.reply({ content: "❌ Không có quyền!", ephemeral: true });

        const name = i.options.getString('name').toLowerCase();
        const value = i.options.getString('value');

        const { data, sha } = await loadKeys();

        data[name] = { value };

        await saveKeys(data, sha);

        i.reply("✅ Add Key Successful");
    }
});

// ================= MESSAGE =================
client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    const args = msg.content.split(' ');
    const cmd = args[0];

    // ===== KEY CHECK =====
    const keys = await loadKeys();
    if (keys.data[msg.content.toLowerCase()]) {
        return msg.reply(`🔑 ${keys.data[msg.content.toLowerCase()].value}`);
    }

    // ===== PLAY =====
    if (cmd === '+play') {

        const vc = msg.member.voice.channel;
        if (!vc) return msg.reply("❌ Vào voice trước!");

        const query = args.slice(1).join(' ');

        let result = await play.search(query, { limit: 1 });

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
            msg.reply("❌ Lỗi tải video");
        }
    }

    // ===== SKIP =====
    if (cmd === '+skip') {
        const q = queue.get(msg.guild.id);
        if (!q) return;
        q.player.stop();
        msg.reply("⏭️ Skip");
    }

    // ===== STOP =====
    if (cmd === '+stop') {
        const q = queue.get(msg.guild.id);
        if (!q) return;
        q.songs = [];
        q.player.stop();
        msg.reply("⏹️ Stop");
    }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
