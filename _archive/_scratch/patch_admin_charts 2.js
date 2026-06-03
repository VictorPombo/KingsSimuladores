const fs = require('fs');
const file = 'apps/site/src/app/(admin)/admin/components/AdminCharts.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add a 5 second timeout to the fetchRevenue promise
if (!content.includes('AbortController')) {
  content = content.replace('const supabase = createClient()', 
    `const supabase = createClient()
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)`);
        
  content = content.replace('const { data: rows } = await query',
    `const { data: rows, error } = await query.abortSignal(controller.signal)
        clearTimeout(timeoutId)
        if (error) throw error`);
        
  fs.writeFileSync(file, content);
  console.log("Patched AdminCharts.tsx");
} else {
  console.log("Already patched");
}
