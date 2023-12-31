import type { AddProductToCartRepoData, CreateCartRepoData, UpdateProductQtyCartRepoData } from '@/interactions/contracts'
import { ObjectId, type Collection } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helper'
import { CartMongoRepo } from './cart-mongo-repo'

const idString = new ObjectId().toHexString()
const objectId = new ObjectId(idString)

const makeFakeCreateCartRepoData = (): CreateCartRepoData => ({
  id: idString,
  userId: 'any_user_id',
  product: {
    id: 'any_product_id',
    quantity: 1
  }
})

const makeFakeAddProductToCartRepoData = (): AddProductToCartRepoData => ({
  id: idString,
  product: {
    id: 'any_product_id',
    quantity: 2
  }
})

const mongoCartWithAProduct = (): any => ({
  _id: objectId,
  userId: 'any_user_id',
  products: [{
    id: 'any_product_id_1',
    quantity: 1
  }]
})

const makeFakeUpdateProductQtyCartRepoData = (): UpdateProductQtyCartRepoData => ({
  id: idString,
  product: {
    id: 'any_product_id_1',
    quantity: 2
  }
})

let cartCollection: Collection

const makeSut = (): CartMongoRepo => {
  const sut = new CartMongoRepo()
  return sut
}

describe('CartMongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    cartCollection = await MongoHelper.getCollection('cart')
    await cartCollection.deleteMany({})
  })

  describe('create()', () => {
    it('Should create a Cart if create is a success', async () => {
      const sut = makeSut()
      await sut.create(makeFakeCreateCartRepoData())
      const cart = await cartCollection.findOne({ _id: objectId })
      expect(cart).toEqual({
        _id: objectId,
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id',
          quantity: 1
        }]
      })
    })
  })

  describe('addProduct()', () => {
    it('Should add product to Cart if addProduct is a success', async () => {
      const sut = makeSut()
      await cartCollection.insertOne(mongoCartWithAProduct())
      await sut.addProduct(makeFakeAddProductToCartRepoData())
      const cart = await cartCollection.findOne({ _id: objectId })
      expect(cart).toEqual({
        _id: objectId,
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id_1',
          quantity: 1
        }, {
          id: 'any_product_id',
          quantity: 2
        }]
      })
    })
  })

  describe('loadByUserId()', () => {
    it('Should load cart if loadByUserId is a success', async () => {
      const sut = makeSut()
      await cartCollection.insertOne(mongoCartWithAProduct())
      const cart = await sut.loadByUserId('any_user_id')
      expect(cart).toEqual({
        id: idString,
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id_1',
          quantity: 1
        }]
      })
    })

    it('Should return null if loadByUserId fails', async () => {
      const sut = makeSut()
      const cart = await sut.loadByUserId('any_user_id')
      expect(cart).toBeNull()
    })
  })

  describe('updateProductQty()', () => {
    it('Should update the quantity of a product in the cart if updateProductQty is a success', async () => {
      const sut = makeSut()
      await cartCollection.insertOne(mongoCartWithAProduct())
      await sut.updateProductQty(makeFakeUpdateProductQtyCartRepoData())
      const cart = await cartCollection.findOne({ _id: objectId })
      expect(cart).toEqual({
        _id: objectId,
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id_1',
          quantity: 2
        }]
      })
    })
  })
})
