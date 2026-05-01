import { Telegraf, Markup, Context } from 'telegraf';
import { supabaseAdmin } from '@/utils/supabase/admin';

const GLOBAL_ADMIN_ID = '5989236776';

export function registerAdminMenus(bot: Telegraf<Context>) {
  bot.action('admin_dashboard', async (ctx) => {
    ctx.answerCbQuery();
    await ctx.reply('🔧 *Panel de Control*\n\nPara ver el mapa en vivo y las métricas completas, por favor ingresa al portal web seguro:', {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🗺️ Ingresar al Dashboard Web', 'https://pruebas-rapidin-app.nswk6n.easypanel.host/dashboard')]
      ])
    });
  });

  bot.action('admin_drivers', async (ctx) => {
    ctx.answerCbQuery('Cargando conductores pendientes...');
    try {
      const { data: inactivos, error } = await supabaseAdmin
        .from('conductores')
        .select('*')
        .eq('estado', 'inactivo');

      if (error) throw error;

      if (!inactivos || inactivos.length === 0) {
        return ctx.reply('✅ No hay conductores pendientes de aprobación.');
      }

      for (const conductor of inactivos) {
        await ctx.reply(
          `🚚 *Solicitud Pendiente*\nID Telegram: ${conductor.telegram_chat_id}`,
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('✅ Aprobar', `admin_aprobar_${conductor.telegram_chat_id}`)],
              [Markup.button.callback('❌ Rechazar', `admin_rechazar_${conductor.telegram_chat_id}`)]
            ])
          }
        );
      }
    } catch (error) {
      console.error("Error cargando conductores pendientes:", error);
      ctx.reply('❌ Error al cargar la lista de conductores.');
    }
  });

  bot.action(/^admin_aprobar_(.+)$/, async (ctx) => {
    const driverId = ctx.match[1];
    ctx.answerCbQuery('Aprobando...');

    try {
      const { error } = await supabaseAdmin
        .from('conductores')
        .update({ estado: 'activo' })
        .eq('telegram_chat_id', driverId);

      if (error) throw error;

      ctx.editMessageText(`✅ Conductor ${driverId} aprobado exitosamente.`);
      
      // Notificar al conductor
      bot.telegram.sendMessage(
        driverId,
        '🎉 *¡Buenas noticias!*\nTu cuenta de conductor ha sido aprobada. Usa /start para acceder a tu panel de conductor.',
        { parse_mode: 'Markdown' }
      ).catch(err => console.error("No se pudo notificar al conductor", err));
    } catch (error) {
      console.error("Error aprobando conductor:", error);
      ctx.editMessageText('❌ Error al aprobar el conductor.');
    }
  });

  bot.action(/^admin_rechazar_(.+)$/, async (ctx) => {
    const driverId = ctx.match[1];
    ctx.answerCbQuery('Rechazando...');

    try {
      const { error } = await supabaseAdmin
        .from('conductores')
        .delete()
        .eq('telegram_chat_id', driverId);

      if (error) throw error;

      ctx.editMessageText(`❌ Solicitud de conductor ${driverId} rechazada.`);
      
      // Notificar al conductor
      bot.telegram.sendMessage(
        driverId,
        'Lo sentimos, tu solicitud para ser conductor ha sido declinada en este momento.'
      ).catch(err => console.error("No se pudo notificar al conductor", err));
    } catch (error) {
      console.error("Error rechazando conductor:", error);
      ctx.editMessageText('❌ Error al rechazar el conductor.');
    }
  });

  bot.action('admin_deliveries', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply('📦 Gestión de Entregas. (En construcción)');
  });
  
}
