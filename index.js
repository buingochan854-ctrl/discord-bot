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

  // Meme + động lực
  if (message.content.toLowerCase().includes("chán học")) {
    message.reply(`Alo Vũ à Vũ...
Không anh ơi 😔

Chán học à?

Thà để giọt mồ hôi rơi trên trang sách còn hơn là giọt nước mắt rơi trên đề thi.

"Học, học nữa, học mãi" - V.I. Lenin

"Đừng lựa chọn an nhàn khi còn trẻ".

"Học tập như thế đi thuyền ngược dòng nước. Bạn phải tiến lên phía trước nếu không muốn bị tụt lại phía sau".

"Lựa chọn hôm nay vẽ nên kết quả của ngày mai".

💪 Hãy luôn nhớ:
Nỗ lực hôm nay = thành công ngày mai!

📚 Đi học tiếp đi bro 😎`);
  }
});

client.login(process.env.TOKEN);
