"use server";

import { supabaseAdmin } from '@/utils/supabase/admin';

export async function createOrderAction(data: {
  originLat: number;
  originLng: number;
  originAddress: string;
  destLat: number;
  destLng: number;
  destAddress: string;
  price: number;
}) {
  const trackingNumber = `TRK-${Math.floor(10000 + Math.random() * 90000)}`;
  
  const { error, data: pedido } = await supabaseAdmin.from('pedidos').insert({
    tracking_number: trackingNumber,
    tipo: 'estandar',
    origen_lat: data.originLat,
    origen_lng: data.originLng,
    origen_direccion: data.originAddress,
    destino_lat: data.destLat,
    destino_lng: data.destLng,
    destino_direccion: data.destAddress,
    creado_por: 'web', // Identificador de que fue creado desde la web B2B
    tarifa_envio: data.price,
    estado: 'creado',
    estado_pago: 'pendiente'
  }).select().single();

  if (error) {
    console.error('Error creating order in Supabase:', error);
    throw new Error('No se pudo crear el pedido');
  }

import { revalidatePath } from 'next/cache';
import bot from '@/telegram/bot';

export async function assignDriverAction(pedidoId: string, conductorId: string) {
  try {
    // 1. Asignar el conductor en Supabase
    const { error, data: pedido } = await supabaseAdmin
      .from('pedidos')
      .update({ 
        conductor_id: conductorId,
        estado: 'asignado_recoleccion'
      })
      .eq('id', pedidoId)
      .select()
      .single();

    if (error) throw error;

    // 2. Obtener el telegram_chat_id del conductor
    const { data: conductor } = await supabaseAdmin
      .from('conductores')
      .select('telegram_chat_id')
      .eq('id', conductorId)
      .single();

    // 3. Notificar al conductor por Telegram
    if (conductor?.telegram_chat_id) {
      const mensaje = 
        `🔔 *¡NUEVO PEDIDO ASIGNADO!*\n\n` +
        `📦 *Tracking:* \`${pedido.tracking_number}\`\n` +
        `📍 *Origen:* ${pedido.origen_direccion || 'GPS'}\n` +
        `🚩 *Destino:* ${pedido.destino_direccion || 'GPS'}\n\n` +
        `Por favor, dirígete al punto de origen para recolectar el paquete. Puedes usar el menú inferior para gestionar tus viajes.`;

      try {
        await bot.telegram.sendMessage(conductor.telegram_chat_id, mensaje, { parse_mode: 'Markdown' });
      } catch (tgError) {
        console.error('Error enviando mensaje de Telegram al conductor:', tgError);
        // No lanzamos error para no interrumpir el flujo si Telegram falla, el pedido ya se asignó en BD.
      }
    }

    revalidatePath('/dashboard/deliveries');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error assigning driver:', error);
    return { success: false, error: 'No se pudo asignar el conductor' };
  }
}
