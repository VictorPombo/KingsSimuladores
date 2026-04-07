import type { Database } from './packages/db/src/database.types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>('https://xyz', '123');

async function test() {
  const { data: profile } = await supabase.from('profiles').select('*').single();
  console.log(profile.role);
}
