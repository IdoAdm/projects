# Set environment variables
$env:PORT = '3001'
$env:SCHEDULER_SERVICE_URL = 'http://localhost:3000'
$env:SUPABASE_URL = 'https://wlsezmbnzovkttjeiizr.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc2V6bWJuem92a3R0amVpaXpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAwODk5NSwiZXhwIjoyMDczNTg0OTk1fQ.lHjJT0V2rKrzQohftJ0AxXCNGWbSgkUaMUtkyYVXSPE'

# Start the server
node server.js
