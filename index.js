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

  if (message.content === 'ping') {
    message.reply('pong 🏓');
  }
});

client.login(process.env.TOKEN);
