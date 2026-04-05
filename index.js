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

  // ping
  if (content === 'ping') {
    return message.reply('pong 🏓');
  }

  // test
  if (content === 'all client') {
    return message.reply('Bot đang hoạt động bình thường 😎');
  }

  // alo vũ
  if (content.includes("alo vũ")) {
    return message.reply("Không anh ơi");
  }

  // ê
  if (content.includes("ê")) {
    return message.reply("im đi ko ai rep đâu 😭");
  }

  // chán học
  if (content.includes("chán học")) {
    return message.reply(`Thà để giọt mồ hôi rơi trên trang sách còn hơn là giọt nước mắt rơi trên đề thi.

💪 Nỗ lực hôm nay = thành công ngày mai!`);
  }

  // TB Delta
  if (content.includes("tb delta")) {
    return message.reply(`VIET : Tb: Hiện tại, Client Delta đã chính thức mua bản quyền và cấm tất cả những bản Client VNG do người Việt làm như: **NakNohack, DatMod, MuyMythicos, TAIYTB,...**

Nên bây giờ, Cộng Đồng CLIENT VIỆT NAM chính thức không thể làm Delta VNG được nữa.

Cảm ơn bạn đã lắng nghe 🙏

- <@1455796719378895022> -`);
  }
});

// login
client.login(process.env.TOKEN);
