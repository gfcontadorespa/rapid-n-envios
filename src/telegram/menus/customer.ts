import { Telegraf, Markup } from 'telegraf';
import { supabaseAdmin } from '@/utils/supabase/admin';

// Exportamos una función que recibe el bot y le registra las acciones del cliente
export function registerCustomerMenus(bot: Telegraf) {
  
  // 1. Inicia la cotización
  bot.action('action_cotizar', (ctx) => {
    ctx.answerCbQuery();
    ctx.editMessageText(
      '📍 *Paso 1: ¿En qué zona recogemos tu paquete?*',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🏙️ Centro', 'orig_centro')],
          [Markup.button.callback('🌲 Norte', 'orig_norte')],
          [Markup.button.callback('🏖️ Sur', 'orig_sur')]
        ])
      }
    );
  });

  // 2. Seleccionó el Origen (ej: Centro), pedimos el Destino
  bot.action(/^orig_(.+)$/, (ctx) => {
    const origen = ctx.match[1];
    ctx.answerCbQuery();
    ctx.editMessageText(
      `📍 *Origen:* ${origen.toUpperCase()} ✅\n\n🎯 *Paso 2: ¿Hacia qué zona lo enviamos?*`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🏙️ Centro', `dest_${origen}_centro`)],
          [Markup.button.callback('🌲 Norte', `dest_${origen}_norte`)],
          [Markup.button.callback('🏖️ Sur', `dest_${origen}_sur`)]
        ])
      }
    );
  });

  // 3. Seleccionó el Destino, calculamos el precio final
  bot.action(/^dest_(.+)_(.+)$/, (ctx) => {
    const origen = ctx.match[1];
    const destino = ctx.match[2];
    
    // Lógica básica de precios: Misma zona = $3.50, Diferente zona = $5.50
    const tarifa = origen === destino ? 3.50 : 5.50;

    ctx.answerCbQuery();
    ctx.editMessageText(
      `✅ *Cotización Lista*\n\n📍 Origen: ${origen.toUpperCase()}\n🎯 Destino: ${destino.toUpperCase()}\n\n💸 *Costo Estimado: $${tarifa.toFixed(2)}*\n\n¿Qué deseas hacer ahora?`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Confirmar y Crear Pedido', `crear_${origen}_${destino}_${tarifa}`)],
          [Markup.button.callback('❌ Cancelar', 'action_cancelar')]
        ])
      }
    );
  });

  // 4. Crear el pedido en Supabase
  bot.action(/^crear_(.+)_(.+)_(.+)$/, async (ctx) => {
    const origen = ctx.match[1];
    const destino = ctx.match[2];
    const tarifa = parseFloat(ctx.match[3]);
    const trackingNumber = `TRK-${Math.floor(10000 + Math.random() * 90000)}`;

    ctx.answerCbQuery('Creando pedido...');

    try {
      const { error } = await supabaseAdmin.from('pedidos').insert({
        tracking_number: trackingNumber,
        tipo: 'estandar',
        origen_lat: 0, // Mock coordinates
        origen_lng: 0,
        origen_direccion: `Zona: ${origen.toUpperCase()}`,
        destino_lat: 0,
        destino_lng: 0,
        destino_direccion: `Zona: ${destino.toUpperCase()}`,
        creado_por: 'cliente',
        tarifa_envio: tarifa,
        estado: 'creado',
        estado_pago: 'pendiente'
      });

      if (error) throw error;

      ctx.editMessageText(
        `📦 *¡Pedido Creado con Éxito!*\n\nTu número de guía es: \`${trackingNumber}\`\n\nUn conductor será asignado pronto. ¡Gracias por usar Rapidín!`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error("Error creando pedido:", error);
      ctx.editMessageText('❌ Ocurrió un error al crear tu pedido. Intenta de nuevo más tarde.');
    }
  });

  // 5. Botón de Cancelar para volver al menú principal
  bot.action('action_cancelar', (ctx) => {
    ctx.answerCbQuery();
    ctx.editMessageText(
      'Cotización cancelada. ¿En qué más te puedo ayudar?',
      Markup.inlineKeyboard([
        [Markup.button.callback('💸 Nueva Cotización', 'action_cotizar')],
        [Markup.button.callback('🚚 Rastrear Paquete', 'action_rastrear')]
      ])
    );
  });

  // 6. Afiliar Mensajero
  bot.action('action_afiliar_mensajero', async (ctx) => {
    ctx.answerCbQuery('Procesando solicitud...');
    const telegramId = ctx.from?.id.toString();

    if (!telegramId) return;

    try {
      // Verificar si ya existe
      const { data: existente } = await supabaseAdmin
        .from('conductores')
        .select('*')
        .eq('telegram_chat_id', telegramId)
        .single();

      if (existente) {
        if (existente.estado === 'inactivo') {
          return ctx.editMessageText('Tu solicitud ya fue enviada y está pendiente de aprobación por un administrador. ⏳');
        } else {
          return ctx.editMessageText('¡Ya eres un conductor activo! Usa el comando /start para ver tu panel operativo. 🚚');
        }
      }

      // Si no existe, lo insertamos como inactivo
      const { error } = await supabaseAdmin.from('conductores').insert({
        telegram_chat_id: telegramId,
        vehiculo: 'Por asignar',
        estado: 'inactivo',
        rol_operativo: 'abierto'
      });

      if (error) throw error;

      ctx.editMessageText(
        '✅ *Solicitud de Afiliación Recibida*\n\n¡Gracias por tu interés en unirte a nuestro equipo! Hemos notificado al administrador. Te avisaremos por aquí una vez que tu cuenta sea aprobada para empezar a hacer entregas.',
        { parse_mode: 'Markdown' }
      );

      // Notificar al admin
      const GLOBAL_ADMIN_ID = '5989236776';
      bot.telegram.sendMessage(
        GLOBAL_ADMIN_ID,
        `🔔 *Nueva Solicitud de Conductor*\nEl usuario ${ctx.from?.first_name || 'Desconocido'} (@${ctx.from?.username || 'sin_usuario'}, ID: ${telegramId}) desea afiliarse.`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Aprobar ahora', `admin_aprobar_${telegramId}`)]
          ])
        }
      );

    } catch (error) {
      console.error("Error al afiliar mensajero:", error);
      ctx.editMessageText('❌ Ocurrió un error al procesar tu solicitud. Intenta nuevamente más tarde.');
    }
  });

}
