import express from "express"
import cors from "cors"
import { env } from "./config"
import { handleError } from "./http"
import { registerGenerateLinksRoute } from "./routes/generateLinks"
import { registerGenerateSlotsRoute } from "./routes/generateSlots"
import { registerPublicBookRoute } from "./routes/publicBook"

const app = express()

app.disable('x-powered-by')
app.use(cors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Public-Token'] }))
app.options('*', cors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'] }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

registerGenerateLinksRoute(app)
registerGenerateSlotsRoute(app)
registerPublicBookRoute(app)

app.use(handleError)

const port = env.PORT
app.listen(port, () => {
  console.log(`[edge] Server listening on :${port}`)
})
