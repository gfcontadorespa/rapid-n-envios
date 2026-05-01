import { Telegraf, Markup } from 'telegraf';
import { supabaseAdmin } from '@/utils/supabase/admin';

// Estado en memoria temporal para las cotizaciones (En producción se recomienda Redis o Base de Datos)
const quoteState = new Map<string, {
  step: 'AWAITING_ORIGIN' | 'AWAITING_ORIGIN_REF' | 'AWAITING_DEST' | 'AWAITING_DEST_REF' | 'CONFIRMING',
  originLat?: number,
  originLng?: number,
  originRef?: string,
  destLat?: number,
  destLng?: number,
  destRef?: string,
  tarifaTotal?: number
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

// Reverse Geocoding usando Mapbox
async function obtenerDireccion(lat: number, lng: number, fallback: string): Promise<string> {
  try {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return fallback;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,neighborhood,poi,place&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      // Devolvemos el nombre corto del lugar (ej. "Costa del Este, Panamá")
      return data.features[0].place_name.replace(', Panama', ''); 
    }
  } catch (error) {
    console.error("Error en Reverse Geocoding:", error);
  }
  return fallback;
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
      quoteState.set(userId, { ...state, step: 'AWAITING_ORIGIN_REF', originLat: lat, originLng: lng });
      ctx.reply(
        '✅ ¡Origen guardado!\n\n📝 *(Opcional)* Escribe una breve **nota de referencia para el origen** (Ej. "Edificio PH, Piso 2", "Preguntar en recepción", etc.).\n\nSi no deseas agregar referencia, presiona "Omitir".',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('⏭️ Omitir Referencia', 'skip_origin_ref')]])
        }
      );
    } else if (state.step === 'AWAITING_DEST') {
      quoteState.set(userId, { ...state, step: 'AWAITING_DEST_REF', destLat: lat, destLng: lng });
      ctx.reply(
        '✅ ¡Destino guardado!\n\n📝 *(Opcional)* Escribe una breve **nota de referencia para el destino**.\n\nSi no deseas agregar referencia, presiona "Omitir".',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[Markup.button.callback('⏭️ Omitir Referencia', 'skip_dest_ref')]])
        }
      );
    }
  });

  // Helper para mostrar la cotización final
  const mostrarCotizacion = (ctx: any, userId: string, state: any) => {
    if (state.originLat === undefined || state.originLng === undefined || state.destLat === undefined || state.destLng === undefined) return;
    
    const distKm = calcularDistancia(state.originLat, state.originLng, state.destLat, state.destLng);
    let tarifaTotal = TARIFAS.BASE + (distKm * TARIFAS.POR_KM);
    if (tarifaTotal < TARIFAS.MINIMA) tarifaTotal = TARIFAS.MINIMA;

    quoteState.set(userId, { ...state, step: 'CONFIRMING', tarifaTotal });

    let refText = '';
    if (state.originRef) refText += `\n*Ref. Origen:* _${state.originRef}_`;
    if (state.destRef) refText += `\n*Ref. Destino:* _${state.destRef}_`;

    ctx.reply(
      `✅ *Cotización Lista*\n\n📏 Distancia: ${distKm.toFixed(2)} km${refText}\n💸 *Costo Estimado: $${tarifaTotal.toFixed(2)}*\n\n*(Tarifa base: $${TARIFAS.BASE.toFixed(2)} + $${TARIFAS.POR_KM.toFixed(2)}/km)*\n\n¿Deseas confirmar el envío?`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Confirmar y Crear Pedido', 'crear_gps_confirm')],
          [Markup.button.callback('❌ Cancelar', 'action_cancelar')]
        ])
      }
    );
  };

  // Botones de Omitir Referencias
  bot.action('skip_origin_ref', (ctx) => {
    ctx.answerCbQuery();
    const userId = ctx.from?.id.toString();
    if (!userId) return;
    const state = quoteState.get(userId);
    if (state?.step === 'AWAITING_ORIGIN_REF') {
      quoteState.set(userId, { ...state, step: 'AWAITING_DEST', originRef: '' });
      ctx.reply(
        '🎯 *Paso 2: ¿A dónde lo llevamos?*\n\nPor favor envíame la ubicación de entrega.',
        { parse_mode: 'Markdown' }
      );
    }
  });

  bot.action('skip_dest_ref', (ctx) => {
    ctx.answerCbQuery();
    const userId = ctx.from?.id.toString();
    if (!userId) return;
    const state = quoteState.get(userId);
    if (state?.step === 'AWAITING_DEST_REF') {
      mostrarCotizacion(ctx, userId, { ...state, destRef: '' });
    }
  });

  // 3. Crear el pedido en Supabase con coordenadas (lee del state local)
  bot.action('crear_gps_confirm', async (ctx) => {
    const userId = ctx.from?.id.toString();
    if (!userId) return;
    
    const state = quoteState.get(userId);
    if (!state || state.step !== 'CONFIRMING' || !state.tarifaTotal || !state.originLat || !state.destLat) {
      return ctx.answerCbQuery('La sesión expiró. Cotiza de nuevo.', { show_alert: true });
    }

    const trackingNumber = `TRK-${Math.floor(10000 + Math.random() * 90000)}`;
    ctx.answerCbQuery('Calculando ruta exacta y creando pedido...');

    try {
      const origenDir = await obtenerDireccion(state.originLat, state.originLng!, 'Ubicación GPS (Origen)');
      const destinoDir = await obtenerDireccion(state.destLat, state.destLng!, 'Ubicación GPS (Destino)');

      const { error } = await supabaseAdmin.from('pedidos').insert({
        tracking_number: trackingNumber,
        tipo: 'estandar',
        origen_lat: state.originLat,
        origen_lng: state.originLng,
        origen_direccion: origenDir,
        origen_referencia: state.originRef,
        destino_lat: state.destLat,
        destino_lng: state.destLng,
        destino_direccion: destinoDir,
        destino_referencia: state.destRef,
        creado_por: userId,
        tarifa_envio: state.tarifaTotal,
        estado: 'creado',
        estado_pago: 'pendiente'
      });

      if (error) throw error;
      
      quoteState.delete(userId);

      ctx.editMessageText(
        `📦 *¡Pedido Creado con Éxito!*\n\n📍 **Origen:** ${origenDir}\n🚩 **Destino:** ${destinoDir}\n\nTu número de guía es: \`${trackingNumber}\`\nEl cobro será de: *$${state.tarifaTotal.toFixed(2)}*\n\nUn conductor será asignado pronto. ¡Gracias por usar Rapidín!`,
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

  // 6. Afiliar Mensajero
  const afiliarState = new Set<string>();

  bot.action('action_afiliar_mensajero', async (ctx) => {
    ctx.answerCbQuery();
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

      afiliarState.add(telegramId);
      ctx.editMessageText(
        '🛵 *Registro de Conductor*\n\n¡Gracias por tu interés en unirte a nuestro equipo!\n\nPor favor, responde a este mensaje con el **tipo de vehículo** que utilizarás para las entregas (Ejemplo: Moto Suzuki, Carro Sedán, Bicicleta):',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error("Error validando conductor:", error);
      ctx.editMessageText('❌ Ocurrió un error. Intenta nuevamente más tarde.');
    }
  });

  // 7. Flujo B2B: Soy Empresa
  const empresaState = new Set<string>();

  bot.action('action_soy_empresa', async (ctx) => {
    ctx.answerCbQuery();
    const userId = ctx.from?.id.toString();
    if (!userId) return;

    try {
      const { data: cliente } = await supabaseAdmin
        .from('clientes_telegram')
        .select('*')
        .eq('telegram_chat_id', userId)
        .single();

      if (cliente && cliente.email_empresa) {
        return ctx.reply('🏢 *Panel Corporativo B2B*\n\nTu cuenta ya está vinculada a un perfil de empresa. Accede a tu portal logístico aquí:', {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.url('🗺️ Abrir Dashboard Web', 'https://pruebas-rapidin-app.nswk6n.easypanel.host/dashboard')]
          ])
        });
      }
    } catch (err) {
      console.log("Error verificando registro B2B:", err);
    }
    
    empresaState.add(userId);
    ctx.reply('🏢 *Registro Corporativo*\n\nPor favor, escríbeme tu **correo electrónico corporativo** para contactarte y darte acceso al Dashboard Web B2B:', { parse_mode: 'Markdown' });
  });

  // Manejador Global de Textos para Estados (Empresa y Conductor)
  bot.on('text', async (ctx, next) => {
    const userId = ctx.from?.id.toString();
    if (!userId) return next();

    // Estado: Referencia Origen
    const quote = quoteState.get(userId);
    if (quote?.step === 'AWAITING_ORIGIN_REF') {
      quoteState.set(userId, { ...quote, step: 'AWAITING_DEST', originRef: ctx.message.text });
      await ctx.reply('🎯 *Paso 2: ¿A dónde lo llevamos?*\n\nPor favor envíame la ubicación de entrega.', { parse_mode: 'Markdown' });
      return;
    }
    
    // Estado: Referencia Destino
    if (quote?.step === 'AWAITING_DEST_REF') {
      mostrarCotizacion(ctx, userId, { ...quote, destRef: ctx.message.text });
      return;
    }

    // Estado: Afiliar Mensajero (Vehículo)
    if (afiliarState.has(userId)) {
      const vehiculo = ctx.message.text;
      afiliarState.delete(userId);

      try {
        await supabaseAdmin.from('conductores').insert({
          telegram_chat_id: userId,
          vehiculo: vehiculo,
          estado: 'inactivo',
          rol_operativo: 'abierto'
        });

        await ctx.reply(
          `✅ *Solicitud de Afiliación Recibida*\n\nVehículo registrado: *${vehiculo}*\n\nHemos notificado al administrador. Te avisaremos por aquí una vez que tu cuenta sea aprobada para empezar a hacer entregas.`,
          { parse_mode: 'Markdown' }
        );

        const GLOBAL_ADMIN_ID = '5989236776';
        bot.telegram.sendMessage(
          GLOBAL_ADMIN_ID,
          `🔔 *Nueva Solicitud de Conductor*\nEl usuario ${ctx.from?.first_name || 'Desconocido'} (@${ctx.from?.username || 'sin_usuario'})\nVehículo: ${vehiculo}`,
          {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
              [Markup.button.callback('✅ Aprobar ahora', `admin_aprobar_${userId}`)]
            ])
          }
        );
      } catch (err) {
        console.error("Error guardando vehículo:", err);
        ctx.reply('❌ Hubo un error al registrar tu vehículo. Intenta de nuevo.');
      }
      return;
    }

    // Estado: Empresa (Email)
    if (empresaState.has(userId)) {
      const email = ctx.message.text;
      empresaState.delete(userId);

      try {
        await supabaseAdmin
          .from('clientes_telegram')
          .update({ email_empresa: email } as any)
          .eq('telegram_chat_id', userId);
      } catch (err) {
        console.log("No se pudo guardar email", err);
      }

      await ctx.reply(`✅ ¡Gracias! Hemos registrado tu correo: *\`${email}\`*.\n\nUn ejecutivo de cuentas se comunicará contigo muy pronto para habilitar tu portal B2B con herramientas avanzadas de logística.`, { parse_mode: 'Markdown' });
      return;
    }

    return next();
  });

}
