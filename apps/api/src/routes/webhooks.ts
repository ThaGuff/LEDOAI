import { Router, Request, Response } from 'express'

export const webhookRoutes = Router()

webhookRoutes.post('/hubspot', async (req: Request, res: Response) => {
  console.log('HubSpot webhook:', req.body)
  res.sendStatus(200)
})

webhookRoutes.post('/calendar', async (req: Request, res: Response) => {
  console.log('Calendar webhook:', req.body)
  res.sendStatus(200)
})
