import { Telegraf, Markup } from 'telegraf';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { registerCustomerMenus } from './menus/customer';
import { registerDriverMenus } from './menus/driver';
import { registerAdminMenus } from './menus/admin';

// ID del Administrador Global
const GLOBAL_ADMIN_ID = '5989236776';

// 1. Inicializamos la instancia principal del bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const nombrePerfil = ctx.from.first_name || 'Usuario';
  
  // 2. Lógica de Administrador Global
  if (telegramId === GLOBAL_ADMIN_ID) {
    await ctx.reply(
      `¡Hola, Global Admin ${nombrePerfil}! 👑\n\nModo Dios activado. Tienes tus herramientas de administrador aquí arriba, y abajo verás el menú normal de usuario:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('📊 Panel de Control', 'admin_dashboard')],
          [Markup.button.callback('🚚 Ver Conductores', 'admin_drivers'), Markup.button.callback('📦 Ver Entregas', 'admin_deliveries')]
        ])
      }
    );
    // ¡OJO! Quité el "return" aquí. 
    // Ahora el código sigue bajando y también te imprimirá el menú de Cliente/Conductor.
  }
  
  try {
    const { data: conductor } = await supabaseAdmin
      .from('conductores')
      .select('*')
      .eq('telegram_chat_id', telegramId)
      .single();

    if (conductor) {
      await ctx.reply(
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

  // 3. Lógica de Clientes Particulares
  let saludo = `¡Hola de nuevo, ${nombrePerfil}! 👋`;
  let faltaTelefono = false;

  try {
    // Buscar si ya es un cliente registrado
    const { data: cliente } = await supabaseAdmin
      .from('clientes_telegram')
      .select('*')
      .eq('telegram_chat_id', telegramId)
      .single();

    if (!cliente) {
      // Es un cliente nuevo, lo registramos silenciosamente
      await supabaseAdmin.from('clientes_telegram').insert({
        telegram_chat_id: telegramId,
        nombre_perfil: nombrePerfil
      });
      saludo = `¡Bienvenido a Rapidín, ${nombrePerfil}! 🎉\nTu solución de envíos ultra-rápida.`;
      faltaTelefono = true;
    } else if (!cliente.telefono) {
      faltaTelefono = true;
    }
  } catch (err) {
    console.error("Error registrando al cliente en Supabase:", err);
  }

  if (faltaTelefono) {
    return ctx.reply(
      `${saludo}\n\nPara poder contactarte por WhatsApp y enviarte notificaciones de tus pedidos, por favor comparte tu número de celular presionando el botón de abajo:`,
      Markup.keyboard([
        [Markup.button.contactRequest('📱 Compartir mi Número de Celular')]
      ]).resize().oneTime()
    );
  }

  // Menú de Cliente (Público) si ya tiene teléfono
  return ctx.reply(
    `${saludo}\n\n¿En qué podemos ayudarte hoy?`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('💸 Cotizar Envío', 'action_cotizar')],
        [Markup.button.callback('🚚 Rastrear Paquete', 'action_rastrear')],
        [Markup.button.callback('🛵 Afiliar mensajero', 'action_afiliar_mensajero')],
        [Markup.button.callback('🏢 Soy Empresa', 'action_soy_empresa')]
      ])
    }
  );
});

// Manejador para cuando el usuario envía su contacto
bot.on('contact', async (ctx) => {
  const telefono = ctx.message.contact.phone_number;
  const telegramId = ctx.from.id.toString();

  try {
    await supabaseAdmin
      .from('clientes_telegram')
      .update({ telefono: telefono } as any)
      .eq('telegram_chat_id', telegramId);

    await ctx.reply('✅ ¡Número guardado exitosamente! Ya podemos contactarte por WhatsApp.', Markup.removeKeyboard());
    
    // Volver a enviar el menú principal
    ctx.reply(
      `¿En qué podemos ayudarte hoy?`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💸 Cotizar Envío', 'action_cotizar')],
          [Markup.button.callback('🚚 Rastrear Paquete', 'action_rastrear')],
          [Markup.button.callback('🛵 Afiliar mensajero', 'action_afiliar_mensajero')],
          [Markup.button.callback('🏢 Soy Empresa', 'action_soy_empresa')]
        ])
      }
    );
  } catch (err) {
    console.error("Error guardando teléfono:", err);
    ctx.reply('❌ Ocurrió un error al guardar tu número.');
  }
});

// Registramos toda la lógica conversacional
registerAdminMenus(bot);
registerCustomerMenus(bot);
registerDriverMenus(bot);

// Otras acciones globales
bot.action('action_rastrear', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('Por favor, escríbeme tu número de tracking o guía de remisión (Ejemplo: TRK-12345):');
});

bot.command('ping', (ctx) => {
  ctx.reply('¡Pong! Sistema activo. 🟢');
});

export default bot;
