const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = '7381610404:AAGf5kI4hhMtIsm5my4eHfq1HEKPlBM45fo';

const bot = new TelegramBot(token, { polling: true });

bot.setMyCommands([
  { command: 'tagall', description: 'Gọi toàn bộ thành viên đã lưu' }
]);

let users = {};
const USERS_FILE = 'users.json';

function loadUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE);
    users = JSON.parse(data);
  } catch (e) {
    users = {};
  }
}

function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

loadUsers();

bot.on('message', (msg) => {
  const chat = msg.chat;
  const user = msg.from;

  if (chat.type === 'group' || chat.type === 'supergroup') {
    users[user.id] = {
      id: user.id,
      first_name: user.first_name,
      username: user.username || null
    };
    saveUsers();
  }
});

bot.onText(/\/tagall/, (msg) => {
  const chatId = msg.chat.id;

  const mentionList = Object.values(users).map((user) => {
    if (user.username) {
      return `@${user.username}`;
    } else {
      return `<a href="tg://user?id=${user.id}">${user.first_name}</a>`;
    }
  });

  const chunkSize = 30;
  for (let i = 0; i < mentionList.length; i += chunkSize) {
    const chunk = mentionList.slice(i, i + chunkSize).join(' ');
    bot.sendMessage(chatId, chunk, { parse_mode: 'HTML' });
  }
});
