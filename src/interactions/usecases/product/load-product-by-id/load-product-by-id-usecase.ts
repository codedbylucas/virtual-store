import type { LoadProductByIdResponse, LoadProductById } from '@/domain/usecases-contracts'
import { InvalidIdError, ProductNotFoundError } from '@/domain/usecases-contracts/export-errors'
import type { LoadProductByIdRepo, ValidationId } from '@/interactions/contracts'
import { left, right } from '@/shared/either'

export class LoadProductByIdUseCase implements LoadProductById {
  constructor (
    private readonly validationId: ValidationId,
    private readonly loadProductByIdRepo: LoadProductByIdRepo
  ) {}

  async perform (productId: string): Promise<LoadProductByIdResponse> {
    this.validationId.isValid(productId)
    const product = await this.loadProductByIdRepo.loadById(productId)
    if (!product) {
      return left(new ProductNotFoundError(productId))
    }
    return right({ id: '', amount: 0, description: '', name: '' })
  }
}
