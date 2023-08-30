import type { LoadProductById } from '@/domain/usecases-contracts'
import type { Controller, Validation } from '@/presentation/contracts'
import { badRequest } from '@/presentation/helpers/http/http-helpers'
import type { HttpRequest, HttpResponse } from '@/presentation/http-types/http'

export class LoadProductByIdController implements Controller {
  constructor (
    private readonly validation: Validation,
    private readonly loadProductById: LoadProductById
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const validation = this.validation.validate(httpRequest.params.productId)
    if (validation.isLeft()) {
      return badRequest(validation.value)
    }
    await this.loadProductById.perform(httpRequest.params.productId)
    return { statusCode: 0, body: '' }
  }
}