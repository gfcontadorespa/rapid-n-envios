import { Telegraf, Markup } from 'telegraf';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { registerCustomerMenus } from './menus/customer';

// 1. Inicializamos la instancia principal del bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  
  try {
    const { data: conductor } = await supabaseAdmin
      .from('conductores')
      .select('*')
      .eq('telegram_chat_id', telegramId)
      .single();

    if (conductor) {
      return ctx.reply(
        `¡Hola Conductor! 🚚\n\nBienvenido a tu panel operativo. ¿Qué deseas hacer hoy?`,
        Markup.keyboard([
          ['📦 Crear Pedido', '📍 Mis Viajes'],
          ['📸 Prueba de Entrega', '⚙️ Mi Estado']
        ]).resize()
      );
    } 
  } catch (err) {
    console.error("Error consultando la base de datos de conductores:", err);
  }

  // Menú de Cliente
  return ctx.reply(
    `¡Bienvenido a Rapidín! 📦\nTu solución de envíos ultra-rápida.\n\nTu ID user es: \`${telegramId}\`\n*(pásale este id al administrador si eres conductor y es primera vez que ingresas a la whitelist)*`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💸 Cotizar Envío', 'action_cotizar')],
        [Markup.button.callback('🚚 Rastrear Paquete', 'action_rastrear')]
      ])
    }
  );
});

// Registramos toda la lógica conversacional del cliente (Cotización, etc)
registerCustomerMenus(bot);

// Otras acciones globales
bot.action('action_rastrear', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Por favor, escríbeme tu número de tracking o guía de remisión (Ejemplo: TRK-12345):');
});

bot.command('ping', (ctx) => {
  ctx.reply('¡Pong! Sistema activo. 🟢');
});

export default bot;
