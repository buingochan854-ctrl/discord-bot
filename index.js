const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log('Bot online!');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  // Lệnh test
  if (message.content === 'ping') {
    message.reply('pong 🏓');
  }

  // Meme alo Vũ
  if (message.content.toLowerCase().includes("alo vũ")) {
    message.reply("Không anh ơi");
  }
});

client.login(process.env.TOKEN);
