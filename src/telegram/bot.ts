import { Telegraf } from 'telegraf';

// 1. Inicializamos la instancia principal del bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

// 2. Aquí conectaremos todos los submódulos más adelante:
// - Lógica de Whitelist
// - Menús de Clientes
// - Menús de Conductores

bot.start((ctx) => {
  ctx.reply('¡Bienvenido a Logística Pro! 📦\n\nTu ID de Telegram es: ' + ctx.from.id + '\n\nEstamos configurando el sistema centralizado.');
});

bot.command('ping', (ctx) => {
  ctx.reply('¡Pong! El módulo de Telegram está súper organizado en su propia carpeta. 🟢');
});

export default bot;
