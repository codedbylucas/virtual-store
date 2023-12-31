import type { AddProductToCart } from '@/domain/usecases-contracts'
import type { Controller, Validation } from '@/presentation/contracts'
import { badRequest, noContent, serverError } from '@/presentation/helpers/http/http-helpers'
import type { HttpRequest, HttpResponse } from '@/presentation/http-types/http'

export class AddProductToCartController implements Controller {
  constructor (
    private readonly validationComposite: Validation,
    private readonly addProductToCart: AddProductToCart
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const validations = this.validationComposite.validate(httpRequest.body)
      if (validations.isLeft()) {
        return badRequest(validations.value)
      }
      const { productId, productQty } = httpRequest.body
      const addProductToCartResult = await this.addProductToCart.perform({
        userId: httpRequest.headers.userId,
        productId,
        productQty
      })
      if (addProductToCartResult.isLeft()) {
        return badRequest(addProductToCartResult.value)
      }
      return noContent()
    } catch (error: any) {
      return serverError(error)
    }
  }
}
