import { Telegraf, Markup } from 'telegraf';

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
          [Markup.button.callback('✅ Confirmar y Crear Pedido', `crear_${origen}_${destino}`)],
          [Markup.button.callback('❌ Cancelar', 'action_cancelar')]
        ])
      }
    );
  });

  // 4. Botón de Cancelar para volver al menú principal
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

}
