import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { twilioRoutes } from './routes/twilio'
import { webhookRoutes } from './routes/webhooks'
import { callRoutes } from './routes/calls'
import { healthRoutes } from './routes/health'
import { startCallWorker } from './queues/callQueue'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  credentials: true,
}))
app.use(morgan('combined'))

// Raw body for Twilio signature verification
app.use('/twilio', express.urlencoded({ extended: false }))
app.use('/twilio', express.raw({ type: 'application/json' }))

// JSON for everything else
app.use(express.json())

// Routes
app.use('/health', healthRoutes)
app.use('/twilio', twilioRoutes)
app.use('/webhooks', webhookRoutes)
app.use('/calls', callRoutes)

app.listen(PORT, () => {
  console.log(`🚀 LEDO API running on port ${PORT}`)
  const worker = startCallWorker()
  if (worker) console.log('✅ Call processing worker started')
})

export default app
