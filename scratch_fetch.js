const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mlrcaugthlkscusyxqrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scmNhdWd0aGxrc2N1c3l4cXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI0Nzk3NywiZXhwIjoyMDkwODIzOTc3fQ.3vPHOQRZj0jMdtFIqYUtehxlNnrOQoHdTdTgcdbAfeE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function search() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, orders(*)')
    .ilike('email', 'rob_edu%')
    .limit(10);
  
  if (error) {
    console.error('Error fetching order:', error);
    return;
  }
  
  console.log(JSON.stringify(data, null, 2));
}

search();
