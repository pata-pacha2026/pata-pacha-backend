import express, { Application } from 'express'
import cors from 'cors'
import compression from 'compression'
import 'express-async-errors'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { httpLogger } from './middleware/logger'
import { authMiddleware } from './middleware/auth'
import { systemRouter } from './modules/system'
import { authRouter } from './modules/auth'
import { productRouter } from './modules/product'
import { categoryRouter } from './modules/category'
import { orderRouter } from './modules/order'
import { promotionRouter } from './modules/promotion'
import { paymentRouter } from './modules/payment'
import { siteConfigRouter } from './modules/site-config'
import { uploadRouter } from './modules/upload'

export const createApp = (): Application => {
  const app = express()

  // HTTP request logging
  app.use(httpLogger)

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN,
      credentials: env.CORS_ORIGIN !== '*',
    })
  )

  // Body parsing and compression
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(compression())

  // API routes - System & Health
  app.use(env.API_PREFIX, systemRouter)

  // Auth (public)
  app.use(`${env.API_PREFIX}/auth`, authRouter)

  // Public read routes
  app.use(`${env.API_PREFIX}/products`, productRouter)
  app.use(`${env.API_PREFIX}/categories`, categoryRouter)
  app.use(`${env.API_PREFIX}/promotions`, promotionRouter)
  app.use(`${env.API_PREFIX}/orders`, orderRouter)
  app.use(`${env.API_PREFIX}/payments`, paymentRouter)
  app.use(`${env.API_PREFIX}/site-config`, siteConfigRouter)
  app.use(`${env.API_PREFIX}/upload`, uploadRouter)

  // Error handling
  app.use(errorHandler)

  return app
}
