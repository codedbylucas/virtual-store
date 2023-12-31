import type { NextFunction, Request, Response } from 'express'
import type { Middleware } from '@/presentation/contracts'
import type { HttpRequest } from '@/presentation/http-types/http'

export const stripeAdaptMiddleware = (middleare: Middleware) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const body = JSON.parse(req.body)
    if (body.payload) {
      req.body = JSON.stringify(body.payload, null, 2)
    }
    const httpRequest: HttpRequest = {
      headers: req.headers
    }
    const httpResponse = await middleare.handle(httpRequest)
    if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
      Object.assign(req.headers, { signature: req.headers['stripe-signature'] })
      next()
    } else {
      res.status(httpResponse.statusCode).json({
        name: httpResponse.body.name,
        error: httpResponse.body.message,
        statusCode: httpResponse.statusCode
      })
    }
  }
}
