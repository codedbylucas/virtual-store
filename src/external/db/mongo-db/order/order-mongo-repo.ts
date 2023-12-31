import type { OrderModel } from '@/domain/models'
import type { AddOrderRepo, LoadOrderByIdRepo, UpdateOrderRepo, UpdateOrderRepoData } from '@/interactions/contracts'
import { MongoHelper } from '../helpers/mongo-helper'

export class OrderMongoRepo implements AddOrderRepo, LoadOrderByIdRepo, UpdateOrderRepo {
  async add (data: OrderModel): Promise<void> {
    const order = MongoHelper.convertCollectionIdStringToObjectId(data)
    const orderCollection = await MongoHelper.getCollection('order')
    await orderCollection.insertOne(order)
  }

  async loadById (id: string): Promise<null | OrderModel > {
    const orderCollection = await MongoHelper.getCollection('order')
    const objectId = MongoHelper.transformIdInObjectId(id)
    const order = await orderCollection.findOne({ _id: objectId })
    return MongoHelper.convertCollectionIdObjectIdToString(order)
  }

  async updateById (data: UpdateOrderRepoData): Promise<void> {
    const objectId = MongoHelper.transformIdInObjectId(data.id)
    const orderCollection = await MongoHelper.getCollection('order')
    const updateObject: Record<string, any> = {}
    if (data.paymentStatus) {
      updateObject.paymentStatus = data.paymentStatus
    }
    if (data.status) {
      updateObject.status = data.status
    }
    updateObject.updatedAt = data.updatedAt
    await orderCollection.updateOne({ _id: objectId }, { $set: updateObject })
  }
}
