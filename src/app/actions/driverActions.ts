'use server';

import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function toggleDriverStatus(driverId: string, newState: 'activo' | 'inactivo') {
  try {
    const { error } = await supabaseAdmin
      .from('conductores')
      .update({ estado: newState })
      .eq('id', driverId);

    if (error) throw error;

    revalidatePath('/dashboard/drivers');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error toggling driver status:", error);
    return { success: false, error: 'Failed to update driver status' };
  }
}
