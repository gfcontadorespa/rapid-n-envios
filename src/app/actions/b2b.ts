"use server";

import { supabaseAdmin } from '@/utils/supabase/admin';
import bot from '@/telegram/bot';
import { revalidatePath } from 'next/cache';

export async function createB2BPortalAction(clienteTelegramId: string) {
  try {
    // 1. Obtener la información del Lead desde Telegram
    const { data: cliente, error: clientErr } = await supabaseAdmin
      .from('clientes_telegram')
      .select('*')
      .eq('telegram_chat_id', clienteTelegramId)
      .single();

    if (clientErr || !cliente || !cliente.email_empresa) {
      throw new Error('No se encontró el cliente o no tiene correo corporativo.');
    }

    // 2. Crear la Empresa
    const nombreEmpresa = `${cliente.nombre_perfil || 'Empresa'} B2B`;
    const { data: empresa, error: empErr } = await supabaseAdmin
      .from('empresas')
      .insert({
        nombre_comercial: nombreEmpresa,
        email_facturacion: cliente.email_empresa,
        telefono: cliente.telefono
      })
      .select()
      .single();

    if (empErr) throw empErr;

    // 3. Crear el Usuario Administrador de la Empresa (Invitación pendiente)
    const { error: usrErr } = await supabaseAdmin
      .from('usuarios_empresas')
      .insert({
        empresa_id: empresa.id,
        nombre: cliente.nombre_perfil || 'Administrador',
        email: cliente.email_empresa,
        rol: 'admin',
        estado: 'pendiente'
      });

    if (usrErr) {
      // Rollback (idealmente, pero Supabase RPC sería mejor. Lo mantenemos simple aquí)
      console.error('Error creando usuario empresa:', usrErr);
      throw usrErr;
    }

    // 4. Notificar al cliente por Telegram
    const portalUrl = 'https://pruebas-rapidin-app.nswk6n.easypanel.host/client/login';
    const mensaje = 
      `🎉 *¡Tu Portal Corporativo está listo!*\n\n` +
      `Hola ${cliente.nombre_perfil}, hemos habilitado tu cuenta de Empresa en Rapidín.\n\n` +
      `🏢 *Empresa:* ${nombreEmpresa}\n` +
      `📧 *Email Registrado:* \`${cliente.email_empresa}\`\n\n` +
      `Puedes acceder a tu panel logístico para cotizar, crear pedidos múltiples y gestionar tus rutas frecuentes desde el siguiente enlace:\n\n` +
      `🔗 [Ingresar al Portal Web](${portalUrl})\n\n` +
      `*(Inicia sesión usando el correo que registraste).*`;

    try {
      await bot.telegram.sendMessage(clienteTelegramId, mensaje, { 
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true }
      });
    } catch (tgError) {
      console.error('Error notificando por Telegram al lead B2B:', tgError);
    }

    // Opcional: Podríamos limpiar el 'email_empresa' de la tabla de Telegram si queremos dejar de mostrarlo como 'Lead Pendiente' 
    // o simplemente añadir un campo 'b2b_aprobado' en clientes_telegram. Por ahora lo dejamos.

    revalidatePath('/dashboard/customers');
    return { success: true, empresa };

  } catch (error) {
    console.error('Error creando portal B2B:', error);
    return { success: false, error: 'No se pudo crear el portal corporativo.' };
  }
}
