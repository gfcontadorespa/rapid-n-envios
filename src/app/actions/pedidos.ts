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

  return pedido;
}
