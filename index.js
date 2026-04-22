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

// ===== CLIENT =====
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const queue = new Map();

// ===== KEY SYSTEM =====
let cache = {};

async function loadKeys() {
    try {
        const res = await axios.get(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/keys.json`,
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`
                }
            }
        );

        const content = Buffer.from(res.data.content, 'base64').toString();

        try {
            cache = JSON.parse(content);
        } catch {
            cache = {};
        }

    } catch {
        cache = {};
    }

    return cache;
}

// ===== MUSIC =====
async function playMusic(guild, song) {
    const q = queue.get(guild.id);

    if (!song) {
        q.connection.destroy();
        queue.delete(guild.id);
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

    } catch {
        q.songs.shift();
        playMusic(guild, q.songs[0]);
    }
}

// ===== READY =====
client.once('clientReady', async () => {
    console.log("🤖 Bot Online");

    // ===== REGISTER SLASH =====
    const commands = [
        new SlashCommandBuilder()
            .setName('status')
            .setDescription('Kiểm tra trạng thái bot')
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
    );

    console.log("✅ Slash OK");
});

// ===== SLASH COMMAND =====
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'status') {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📊 Bot Status")
                    .addFields(
                        { name: "🟢 Trạng thái", value: "Online", inline: true },
                        { name: "⏱ Uptime", value: `${Math.floor(process.uptime())}s`, inline: true },
                        { name: "🌍 Servers", value: `${client.guilds.cache.size}`, inline: true }
                    )
                    .setColor("Green")
            ]
        });
    }
});

// ===== MESSAGE COMMAND =====
client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    const args = msg.content.split(' ');
    const cmd = args[0];

    // ===== KEY =====
    const keys = await loadKeys();
    if (keys[msg.content.toLowerCase()]) {
        return msg.reply(`🔑 ${keys[msg.content.toLowerCase()].value}`);
    }

    // ===== PLAY =====
    if (cmd === '+play') {

        const vc = msg.member.voice.channel;
        if (!vc) return msg.reply("❌ Vào voice trước!");

        const query = args.slice(1).join(' ');
        if (!query) return msg.reply("❌ Nhập tên!");

        const result = await play.search(query, { limit: 1 });

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

    // ===== TAIVIDEO =====
    if (cmd === '+taivideo') {
        const url = args[1];
        if (!url) return msg.reply("❌ Nhập link");

        msg.reply("⏳ Đang xử lý...");

        try {
            const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const video = res.data?.data?.play;

            if (!video) return msg.reply("❌ Lỗi video");

            msg.reply(video);

        } catch {
            msg.reply("❌ Lỗi xử lý video");
        }
    }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
