require('dotenv').config();

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus
} = require('@discordjs/voice');

const express = require('express');
const axios = require('axios');
const play = require('play-dl');

// ===== CONFIG =====
const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const queue = new Map();

// ===== DASHBOARD WEB =====
app.get('/', (req, res) => {
    res.send(`
    <h1>🤖 Bot V7 Online</h1>
    <p>Status: OK</p>
    <p>Servers: ${client.guilds.cache.size}</p>
    `);
});

app.get('/status', (req, res) => {
    res.json({
        online: true,
        guilds: client.guilds.cache.size,
        uptime: process.uptime()
    });
});

app.listen(PORT, () => console.log("🌐 Dashboard running"));

// ================= KEY SYSTEM =================
let cache = {};

async function loadKeys() {
    try {
        const res = await axios.get(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/keys.json`,
            { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );

        const content = Buffer.from(res.data.content, 'base64').toString();

        try {
            cache = JSON.parse(content);
        } catch {
            cache = {};
        }

        return { data: cache, sha: res.data.sha };

    } catch {
        return { data: cache, sha: null };
    }
}

// ================= MUSIC =================
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

// ================= READY =================
client.once('clientReady', () => {
    console.log("🤖 V7 Online");
});

// ================= COMMAND =================
client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    const args = msg.content.split(' ');
    const cmd = args[0];

    // ===== KEY =====
    const { data } = await loadKeys();
    if (data[msg.content.toLowerCase()]) {
        return msg.reply(`🔑 ${data[msg.content.toLowerCase()].value}`);
    }

    // ===== PLAY =====
    if (cmd === '+play') {

        if (!msg.member.voice.channel)
            return msg.reply("❌ Vào voice trước");

        const query = args.slice(1).join(' ');
        let song;

        try {
            const yt = await play.search(query, { limit: 1 });

            song = {
                title: yt[0].title,
                url: yt[0].url
            };

        } catch {
            return msg.reply("❌ Không tìm thấy");
        }

        let q = queue.get(msg.guild.id);

        if (!q) {
            q = {
                voiceChannel: msg.member.voice.channel,
                connection: null,
                player: createAudioPlayer(),
                songs: []
            };

            queue.set(msg.guild.id, q);
            q.songs.push(song);

            const connection = joinVoiceChannel({
                channelId: q.voiceChannel.id,
                guildId: msg.guild.id,
                adapterCreator: msg.guild.voiceAdapterCreator
            });

            q.connection = connection;
            connection.subscribe(q.player);

            playMusic(msg.guild, q.songs[0]);

        } else {
            q.songs.push(song);
        }

        const embed = new EmbedBuilder()
            .setTitle("🎶 Now Playing")
            .setDescription(`[${song.title}](${song.url})`)
            .setColor("Green");

        msg.reply({ embeds: [embed] });
    }

    // ===== VIDEO =====
    if (cmd === '+taivideo') {
        const url = args[1];
        if (!url) return msg.reply("❌ Nhập link");

        try {
            const api = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const video = api.data?.data?.play;

            msg.reply(video || "❌ Lỗi");
        } catch {
            msg.reply("❌ Lỗi video");
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

// ================= LOGIN =================
client.login(process.env.TOKEN);
