import { Router, Request, Response } from 'express'

export const callRoutes = Router()

callRoutes.get('/', async (req: Request, res: Response) => {
  // TODO: return paginated call logs from DB
  res.json({ calls: [], total: 0 })
})

callRoutes.get('/:id', async (req: Request, res: Response) => {
  res.json({ id: req.params.id, message: 'Call detail endpoint' })
})
