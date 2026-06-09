const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mlrcaugthlkscusyxqrf.supabase.co"
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scmNhdWd0aGxrc2N1c3l4cXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI0Nzk3NywiZXhwIjoyMDkwODIzOTc3fQ.3vPHOQRZj0jMdtFIqYUtehxlNnrOQoHdTdTgcdbAfeE"

async function run() {
  const res = await fetch(`${url}/rest/v1/order_jobs?status=eq.dead`, {
    method: 'DELETE',
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    }
  })
  
  if (!res.ok) {
    console.error("Failed to delete:", await res.text())
    return
  }
  
  console.log("Successfully deleted all dead jobs.")
}

run()
