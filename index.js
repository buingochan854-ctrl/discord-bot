const { Client, GatewayIntentBits } = require('discord.js');

// Tạo client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Khi bot online
client.on('ready', () => {
  console.log('Bot đang trực tuyến!');
});

// Khi có tin nhắn
client.on('messageCreate', message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Lệnh test
  if (content === 'ping') {
    message.reply('pong 🏓');
  }

  // Meme alo Vũ
  if (content.includes("alo vũ")) {
    message.reply("Không anh ơi");
  }

  // Meme + động lực
  if (content.includes("chán học")) {
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

  // Test thêm (tránh nhầm lỗi)
  if (content === 'all client') {
    message.reply('Bot đang hoạt động bình thường 😎');
  }
});
const { Client, GatewayIntentBits } = require('discord.js');

// Tạo client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Khi bot online
client.on('ready', () => {
  console.log('Bot đang trực tuyến!');
});

// Khi có tin nhắn
client.on('messageCreate', message => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // Lệnh test
  if (content === 'ping') {
    message.reply('pong 🏓');
  }

  // Meme alo Vũ
  if (content.includes("alo vũ")) {
    message.reply("Không anh ơi");
  }

  // Meme + động lực
  if (content.includes("chán học")) {
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

  // Test thêm (tránh nhầm lỗi)
  if (content === 'all client') {
    message.reply('Bot đang hoạt động bình thường 😎');
  }
});
if (content.includes("ê")) {
  message.reply("im đi ko ai rep đâu 😭");
}
// Login bằng TOKEN (Render / Replit đều dùng được)
client.login(process.env.TOKEN);
