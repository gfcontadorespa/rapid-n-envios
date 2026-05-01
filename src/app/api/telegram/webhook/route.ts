import { NextRequest, NextResponse } from 'next/server';
import bot from '@/telegram/bot';

// Manejador del Webhook para Next.js App Router
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Le pasamos el mensaje que envió el usuario al módulo central de Telegram
    await bot.handleUpdate(body);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error procesando webhook de Telegram:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Ruta GET para verificar que el servidor está vivo desde el navegador
export async function GET() {
  return NextResponse.json({ status: 'Endpoint del Webhook de Telegram activo y enrutando al módulo principal 🤖' });
}
