import { Router } from 'express'

export const healthRoutes = Router()

healthRoutes.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ledo-api', timestamp: new Date().toISOString() })
})
