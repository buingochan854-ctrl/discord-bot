require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// ====== CHECK TOKEN ======
console.log(">>>TOKEN START<<<");
console.log(process.env.TOKEN);
console.log(">>>TOKEN END<<<");
console.log("LENGTH:", process.env.TOKEN?.length);

// ====== TẠO CLIENT ======
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ====== BOT ONLINE ======
client.once('ready', () => {
    console.log(`✅ Bot đã online: ${client.user.tag}`);
});

// ====== EVENT MESSAGE ======
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    // !ping
    if (message.content === '!ping') {
        message.reply('🏓 Pong!');
    }

    // !hello
    if (message.content === '!hello') {
        message.reply('👋 Xin chào!');
    }

    // !meme (random ảnh)
    if (message.content === '!meme') {
        const memes = [
            'https://i.imgur.com/1.jpg',
            'https://i.imgur.com/2.jpg',
            'https://i.imgur.com/3.jpg'
        ];
        const random = memes[Math.floor(Math.random() * memes.length)];
        message.reply(random);
    }
});

// ====== LOGIN ======
client.login(process.env.TOKEN).catch(err => {
    console.error("❌ LOGIN LỖI:", err);
});
