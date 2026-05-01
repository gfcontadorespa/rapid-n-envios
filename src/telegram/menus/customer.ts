import { Telegraf, Markup } from 'telegraf';
import { supabaseAdmin } from '@/utils/supabase/admin';

// Estado en memoria temporal para las cotizaciones (En producción se recomienda Redis o Base de Datos)
const quoteState = new Map<string, {
  step: 'AWAITING_ORIGIN' | 'AWAITING_DEST',
  originLat?: number,
  originLng?: number,
  destLat?: number,
  destLng?: number
}>();

// Configuración de tarifas (Fácil de mover a la BD en el futuro para personalizar)
const TARIFAS = {
  BASE: 2.50, // Costo base por inicio del servicio
  POR_KM: 0.80, // Costo por cada kilómetro recorrido
  MINIMA: 3.50 // Tarifa mínima a cobrar
};

// Fórmula matemática para calcular distancia en KM (Haversine)
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function registerCustomerMenus(bot: Telegraf) {
  
  // 1. Inicia la cotización pidiendo ubicación de Origen
  bot.action('action_cotizar', (ctx) => {
    ctx.answerCbQuery();
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    quoteState.set(userId, { step: 'AWAITING_ORIGIN' });

    ctx.reply(
      '📍 *Paso 1: ¿Dónde recogemos el paquete?*\n\nPor favor, envíame la ubicación. Puedes usar el botón de abajo para enviar tu ubicación actual de forma rápida.',
      {
        parse_mode: 'Markdown',
        ...Markup.keyboard([
          [Markup.button.locationRequest('📍 Compartir mi Ubicación Actual')]
        ]).resize().oneTime()
      }
    );
  });

  // 2. Escuchar ubicaciones enviadas por el usuario
  bot.on('location', (ctx) => {
    const userId = ctx.from?.id.toString();
    const state = quoteState.get(userId);
    const lat = ctx.message.location.latitude;
    const lng = ctx.message.location.longitude;

    if (!state) return; // Si no está en medio de una cotización, ignoramos

    if (state.step === 'AWAITING_ORIGIN') {
      // Guardar origen y pedir destino
      quoteState.set(userId, { step: 'AWAITING_DEST', originLat: lat, originLng: lng });
      ctx.reply(
        '✅ ¡Origen guardado!\n\n🎯 *Paso 2: ¿A dónde lo llevamos?*\n\nPor favor envíame la ubicación de entrega. (Puedes adjuntarla usando el ícono del clip 📎 y seleccionando "Ubicación" para buscarla en el mapa).',
        {
          parse_mode: 'Markdown',
          ...Markup.removeKeyboard() // Quitamos el teclado de ubicación actual
        }
      );
    } else if (state.step === 'AWAITING_DEST') {
      // Guardar destino y calcular tarifa
      if (state.originLat === undefined || state.originLng === undefined) return;
      
      const distKm = calcularDistancia(state.originLat, state.originLng, lat, lng);
      
      // Cálculo de tarifa
      let tarifaTotal = TARIFAS.BASE + (distKm * TARIFAS.POR_KM);
      if (tarifaTotal < TARIFAS.MINIMA) tarifaTotal = TARIFAS.MINIMA; // Respetar tarifa mínima

      ctx.reply(
        `✅ *Cotización Lista*\n\n📏 Distancia calculada: ${distKm.toFixed(2)} km\n💸 *Costo Estimado: $${tarifaTotal.toFixed(2)}*\n\n*(Tarifa base: $${TARIFAS.BASE.toFixed(2)} + $${TARIFAS.POR_KM.toFixed(2)}/km)*\n\n¿Deseas confirmar el envío?`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Confirmar y Crear Pedido', `crear_gps_${state.originLat}_${state.originLng}_${lat}_${lng}_${tarifaTotal.toFixed(2)}`)],
            [Markup.button.callback('❌ Cancelar', 'action_cancelar')]
          ])
        }
      );
      
      // Limpiamos el estado
      quoteState.delete(userId);
    }
  });

  // 3. Crear el pedido en Supabase con coordenadas
  bot.action(/^crear_gps_(.+)_(.+)_(.+)_(.+)_(.+)$/, async (ctx) => {
    const originLat = parseFloat(ctx.match[1]);
    const originLng = parseFloat(ctx.match[2]);
    const destLat = parseFloat(ctx.match[3]);
    const destLng = parseFloat(ctx.match[4]);
    const tarifa = parseFloat(ctx.match[5]);
    
    const trackingNumber = `TRK-${Math.floor(10000 + Math.random() * 90000)}`;

    ctx.answerCbQuery('Creando pedido...');

    try {
      const { error } = await supabaseAdmin.from('pedidos').insert({
        tracking_number: trackingNumber,
        tipo: 'estandar',
        origen_lat: originLat,
        origen_lng: originLng,
        origen_direccion: 'Ubicación GPS (Origen)',
        destino_lat: destLat,
        destino_lng: destLng,
        destino_direccion: 'Ubicación GPS (Destino)',
        creado_por: 'cliente',
        tarifa_envio: tarifa,
        estado: 'creado',
        estado_pago: 'pendiente'
      });

      if (error) throw error;

      ctx.editMessageText(
        `📦 *¡Pedido Creado con Éxito!*\n\nTu número de guía es: \`${trackingNumber}\`\nEl cobro será de: *$${tarifa.toFixed(2)}*\n\nUn conductor recibirá las coordenadas y será asignado pronto. ¡Gracias por usar Rapidín!`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error("Error creando pedido GPS:", error);
      ctx.editMessageText('❌ Ocurrió un error al crear tu pedido. Intenta de nuevo más tarde.');
    }
  });

  // 4. Botón de Cancelar para volver al menú principal
  bot.action('action_cancelar', (ctx) => {
    ctx.answerCbQuery();
    const userId = ctx.from?.id.toString();
    if (userId) quoteState.delete(userId); // Limpiar si había algo

    ctx.editMessageText(
      'Cotización cancelada. ¿En qué más te puedo ayudar?',
      Markup.inlineKeyboard([
        [Markup.button.callback('💸 Nueva Cotización', 'action_cotizar')],
        [Markup.button.callback('🚚 Rastrear Paquete', 'action_rastrear')]
      ])
    );
  });

  // 6. Afiliar Mensajero (Sin cambios)
  bot.action('action_afiliar_mensajero', async (ctx) => {
    ctx.answerCbQuery('Procesando solicitud...');
    const telegramId = ctx.from?.id.toString();

    if (!telegramId) return;

    try {
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

  // 7. Flujo B2B: Soy Empresa
  const empresaState = new Set<string>();

  bot.action('action_soy_empresa', async (ctx) => {
    ctx.answerCbQuery();
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    try {
      // Verificar si ya tiene el correo registrado o está vinculado a un cliente
      const { data: cliente } = await supabaseAdmin
        .from('clientes_telegram')
        .select('*')
        .eq('telegram_chat_id', userId)
        .single();

      // Suponemos que si tiene 'email_empresa' (o un campo similar), ya está validado
      if (cliente && cliente.email_empresa) {
        return ctx.reply('🏢 *Panel Corporativo B2B*\n\nTu cuenta ya está vinculada a un perfil de empresa. Accede a tu portal logístico aquí:', {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('🗺️ Abrir Dashboard Web', 'https://pruebas-rapidin-app.nswk6n.easypanel.host')]
          ])
        });
      }
    } catch (err) {
      console.log("Error verificando registro B2B:", err);
    }
    
    // Si no tiene correo registrado, iniciamos el flujo de captura
    empresaState.add(userId);
    ctx.reply('🏢 *Registro Corporativo*\n\nPor favor, escríbeme tu **correo electrónico corporativo** para contactarte y darte acceso al Dashboard Web B2B:', { parse_mode: 'Markdown' });
  });

  bot.on('text', async (ctx, next) => {
    const userId = ctx.from?.id.toString();
    if (userId && empresaState.has(userId)) {
      const email = ctx.message.text;
      
      // Guardar en Supabase (Opcional, en la tabla clientes_telegram si añadimos columna email)
      try {
        await supabaseAdmin
          .from('clientes_telegram')
          .update({ email_empresa: email } as any) // as any por si la columna no existe en los tipos TS aún
          .eq('telegram_chat_id', userId);
      } catch (err) {
        console.log("No se pudo guardar email", err);
      }

      empresaState.delete(userId);
      await ctx.reply(`✅ ¡Gracias! Hemos registrado tu correo: *\`${email}\`*.\n\nUn ejecutivo de cuentas se comunicará contigo muy pronto para habilitar tu portal B2B con herramientas avanzadas de logística.`, { parse_mode: 'Markdown' });
    } else {
      return next();
    }
  });

}
