import { Telegraf, Markup } from 'telegraf';
import { supabaseAdmin } from '@/utils/supabase/admin';

// 1. Inicializamos la instancia principal del bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  
  try {
    // 2. Lógica de Whitelist: ¿Es este ID de Telegram un Conductor autorizado?
    const { data: conductor } = await supabaseAdmin
      .from('conductores')
      .select('*')
      .eq('telegram_chat_id', telegramId)
      .single();

    if (conductor) {
      // ✅ Es un conductor autorizado (Menú Operativo - Teclado Inferior)
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

  // 👤 No es conductor. Se le muestra el Menú de Cliente (Público - Teclado en el chat)
  return ctx.reply(
    `¡Bienvenido a Rapidín! 📦\nTu solución de envíos ultra-rápida.\n\nTu ID de Telegram es: \`${telegramId}\`\n*(Pásale este ID al administrador si eres conductor para que te agregue a la Whitelist).*`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💸 Cotizar Envío', 'action_cotizar')],
        [Markup.button.callback('🚚 Rastrear Paquete', 'action_rastrear')],
        [Markup.button.callback('📲 Contactar Soporte', 'action_soporte')]
      ])
    }
  );
});

// 3. Respuestas a los botones interactivos del Cliente
bot.action('action_cotizar', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Para cotizar un envío de manera inteligente, ingresa a nuestro portal web: [Próximamente la URL de tu Dashboard]');
});

bot.action('action_rastrear', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Por favor, escríbeme tu número de tracking o guía de remisión (Ejemplo: TRK-12345):');
});

bot.action('action_soporte', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Nuestro equipo de soporte te atenderá en horario de oficina. Escríbenos a soporte@empresa.com');
});

// Comando técnico para probar latencia
bot.command('ping', (ctx) => {
  ctx.reply('¡Pong! Sistema activo, Base de Datos conectada y Whitelist funcionando. 🟢');
});

export default bot;
