import type { Router } from 'express'
import { adaptRoute } from '../adapters/express-route-adapter'
import { makeAddProductController } from '../factories/controllers/product/add-product-factory'
import { adaptMiddleware } from '../adapters/express-middleware-adapter'
import { makeAccessControlMiddleware } from '../factories/middleware/access-control-middleware-factory'

export default async (router: Router): Promise<void> => {
  router.post('/product', adaptMiddleware(makeAccessControlMiddleware('admin')), adaptRoute(makeAddProductController()))
}
