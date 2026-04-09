import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@kings/db';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from('products').select('title');
    if (error) return NextResponse.json({ error });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
