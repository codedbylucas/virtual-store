import type { StatusOfOrderModel } from '@/domain/models'
import type { AddOrder, AddOrderData } from '@/domain/usecases-contracts'
import type { AddOrderRepo, IdBuilder } from '@/interactions/contracts'
import { right, type Either } from '@/shared/either'

export class AddOrderUseCase implements AddOrder {
  reqProps: Array<keyof AddOrderData> = ['orderCode', 'userId', 'products']
  constructor (
    private readonly idBuilder: IdBuilder,
    private readonly status: StatusOfOrderModel,
    private readonly addOrderRepo: AddOrderRepo
  ) {}

  async perform (data: AddOrderData): Promise<Either<Error, null>> {
    const { orderCode, products, userId } = data
    const { id } = this.idBuilder.build()
    const date = new Date()
    const status = this.status
    await this.addOrderRepo.add(
      { id, userId, orderCode, products, createdAt: date, updatedAt: date, status }
    )
    return right(null)
  }
}