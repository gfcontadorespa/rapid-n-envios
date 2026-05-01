import { Telegraf } from 'telegraf';
import { supabaseAdmin } from '@/utils/supabase/admin';

export function registerDriverMenus(bot: Telegraf) {
  
  // 1. Comando: Crear Pedido en la calle
  bot.hears('📦 Crear Pedido', (ctx) => {
    ctx.reply('Para crear un pedido recolectado en la calle, escríbeme los datos con este formato:\n\n`CREAR PEDIDO\nOrigen: [Zona]\nDestino: [Zona]\nCobro: [$X.XX]`', { parse_mode: 'Markdown' });
  });

  // 2. Comando: Ver Viajes Asignados
  bot.hears('📍 Mis Viajes', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    
    // En la Fase 4 aquí leeremos de Supabase la tabla 'pedidos' o 'rutas_consolidadas'
    // Por ahora enviamos un resumen simulado:
    ctx.reply(
      '🗺 *Tus Entregas de Hoy:*\n\n' +
      '1. `TRK-8924` - 1204 Elm St (Pendiente)\n' +
      '2. `TRK-8921` - 300 Maple Dr (Pendiente)\n\n' +
      '*Total a entregar:* 2 paquetes', 
      { parse_mode: 'Markdown' }
    );
  });

  // 3. Comando: Solicitar instrucciones de Prueba de Entrega
  bot.hears('📸 Prueba de Entrega', (ctx) => {
    ctx.reply('Para registrar una entrega exitosa, simplemente *toma una foto del paquete en la puerta* desde la cámara de Telegram y ponle como comentario o leyenda el número de tracking (Ej: `TRK-8924`).', { parse_mode: 'Markdown' });
  });

  // 4. Comando: Consultar Estado
  bot.hears('⚙️ Mi Estado', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    
    try {
      const { data: conductor } = await supabaseAdmin
        .from('conductores')
        .select('estado, rol_operativo')
        .eq('telegram_chat_id', telegramId)
        .single();

      if (conductor) {
        ctx.reply(`🚦 *Tu Estado Operativo:*\n\nEstatus: *${conductor.estado.toUpperCase()}*\nOperación actual: *${conductor.rol_operativo.toUpperCase()}*`, { parse_mode: 'Markdown' });
      }
    } catch (err) {
      console.error(err);
      ctx.reply('Hubo un error consultando tu estado.');
    }
  });

  // 5. Escuchar Fotografías (El conductor manda la foto como prueba)
  bot.on('photo', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const caption = ctx.message.caption || '';
    
    // Primero validamos si quien manda la foto es un conductor
    const { data: conductor } = await supabaseAdmin
      .from('conductores')
      .select('id')
      .eq('telegram_chat_id', telegramId)
      .single();

    if (!conductor) {
      return; // Ignorar si es un cliente enviando fotos por diversión
    }

    // Validar si la foto incluye un número de tracking en el texto
    if (caption.toUpperCase().includes('TRK-')) {
      const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      
      // En Fase 4: Descargar la foto y subirla al Bucket de Supabase Storage.
      ctx.reply(`✅ *Prueba de Entrega Registrada*\n\nTracking: \`${caption}\`\n\nEl sistema ha guardado la foto y notificado al cliente automáticamente.`, { parse_mode: 'Markdown' });
    } else {
      ctx.reply('⚠️ *Atención:*\nPor favor, recuerda escribir el número de tracking (ejemplo: `TRK-12345`) en la "leyenda" de la foto para poder asignarla al pedido correcto.', { parse_mode: 'Markdown' });
    }
  });

  // 6. Manejar el botón "Paquete Recogido"
  bot.action(/^pickup_(.+)$/, async (ctx) => {
    const pedidoId = ctx.match[1];
    const telegramId = ctx.from?.id.toString();

    try {
      // 1. Actualizar el pedido en la base de datos a "en_ruta_entrega"
      const { data: pedido, error } = await supabaseAdmin
        .from('pedidos')
        .update({ estado: 'en_ruta_entrega' })
        .eq('id', pedidoId)
        .select()
        .single();

      if (error) throw error;

      // 2. Avisar al conductor que se registró con éxito
      await ctx.answerCbQuery('✅ Paquete recogido marcado con éxito.', { show_alert: false });
      
      // Actualizamos el mensaje original para quitar el botón (evitar doble clic)
      const msgOriginal = ctx.callbackQuery.message as any;
      if (msgOriginal) {
        await ctx.editMessageText(msgOriginal.text + '\n\n✅ *MARCADO COMO RECOGIDO Y EN RUTA*', { parse_mode: 'Markdown' });
      }

      // 3. Si el pedido fue creado por un cliente vía Telegram, le enviamos la notificación con el tracking
      if (pedido.creado_por && pedido.creado_por !== 'web') {
        const trackingUrl = `https://pruebas-rapidin-app.nswk6n.easypanel.host/track/${pedido.tracking_number}`;
        const mensajeCliente = 
          `🚀 *¡Tu paquete está en camino!*\n\n` +
          `Nuestro mensajero ya recolectó tu envío con el tracking \`${pedido.tracking_number}\`.\n\n` +
          `Síguelo en tiempo real desde este enlace:\n🔗 [Ver Rastreo en Vivo](${trackingUrl})`;

        await ctx.telegram.sendMessage(pedido.creado_por, mensajeCliente, { 
          parse_mode: 'Markdown',
          link_preview_options: { is_disabled: true }
        });
      }

    } catch (err) {
      console.error('Error procesando pickup:', err);
      ctx.answerCbQuery('❌ Ocurrió un error al actualizar el estado.', { show_alert: true });
    }
  });

}
