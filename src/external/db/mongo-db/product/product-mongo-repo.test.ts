import type { ProductModel } from '@/domain/models'
import { type Collection, ObjectId } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helper'
import { ProductMongoRepo } from './product-mongo-repo'

const idString = new ObjectId().toHexString()
const objectId = new ObjectId(idString)

const makeFakeProductModel = (): ProductModel => ({
  id: idString,
  name: 'any name',
  amount: 10.90,
  description: 'any description'
})

type ProductModelWithObjectId = Omit<ProductModel, 'id'> & {
  _id: ObjectId
}

const makeFakeProductWithObjectId = (product: ProductModel): ProductModelWithObjectId => {
  return MongoHelper.convertCollectionIdStringToObjectId(product)
}

const makeFakeProductWithStringId = (product: ProductModelWithObjectId): ProductModel => {
  return MongoHelper.convertCollectionIdObjectIdToString(product)
}

let productCollection: Collection

const makeSut = (): ProductMongoRepo => {
  const sut = new ProductMongoRepo()
  return sut
}

describe('ProductMongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    productCollection = await MongoHelper.getCollection('product')
    await productCollection.deleteMany({})
  })

  describe('add()', () => {
    it('Should create a Product if add on success', async () => {
      const sut = makeSut()
      await sut.add(makeFakeProductModel())
      const product = await productCollection.findOne({ _id: objectId })
      const productWithObjectId = makeFakeProductWithObjectId(makeFakeProductModel())
      expect(product).toEqual(productWithObjectId)
    })
  })

  describe('loadAll()', () => {
    it('Should load all products on success', async () => {
      const sut = makeSut()
      const anotherObjectId = new ObjectId()
      const anyProduct = makeFakeProductWithObjectId(makeFakeProductModel())
      const anotherProduct = {
        _id: anotherObjectId,
        name: 'another name',
        amount: 11.90,
        description: 'any description'
      }
      await productCollection.insertMany([anyProduct, anotherProduct])
      const products = await sut.loadAll()
      expect(products[0]).toEqual(makeFakeProductWithStringId(anyProduct))
      expect(products[1]).toEqual(makeFakeProductWithStringId(anotherProduct))
    })

    it('Should load empty list if no product was found', async () => {
      const sut = makeSut()
      const products = await sut.loadAll()
      expect(products.length).toBe(0)
    })
  })

  describe('loadById()', () => {
    it('Should load product on success', async () => {
      const sut = makeSut()
      const productData = makeFakeProductWithObjectId(makeFakeProductModel())
      await productCollection.insertOne(productData)
      const product = await sut.loadById(idString)
      expect(product).toEqual(makeFakeProductWithStringId(productData))
    })

    it('Should return null if not found a product', async () => {
      const sut = makeSut()
      const product = await sut.loadById(idString)
      expect(product).toBeNull()
    })
  })

  describe('loadProductsByIds()', () => {
    it('Should load many products by ids on success', async () => {
      const sut = makeSut()
      const anotherObjectId = new ObjectId()
      const anotherStringId = anotherObjectId.toHexString()
      const anyProduct = makeFakeProductWithObjectId(makeFakeProductModel())
      const anotherProduct = {
        _id: anotherObjectId,
        name: 'another name',
        amount: 11.90,
        description: 'any description'
      }
      await productCollection.insertMany([anyProduct, anotherProduct])
      const products = await sut.loadProductsByIds([idString, anotherStringId])
      expect(products[0]).toEqual(makeFakeProductWithStringId(anyProduct))
      expect(products[1]).toEqual(makeFakeProductWithStringId(anotherProduct))
    })

    it('Should only load products that the id is valid', async () => {
      const sut = makeSut()
      const anotherObjectId = new ObjectId()
      const anotherStringId = anotherObjectId.toHexString()
      const productIdThatDoesNotExist = new ObjectId().toHexString()
      const anyProduct = makeFakeProductWithObjectId(makeFakeProductModel())
      const anotherProduct = {
        _id: anotherObjectId,
        name: 'another name',
        amount: 11.90,
        description: 'any description'
      }
      await productCollection.insertMany([anyProduct, anotherProduct])
      const products = await sut.loadProductsByIds([idString, productIdThatDoesNotExist, anotherStringId])
      expect(products.length).toBe(2)
      expect(products[0]).toEqual(makeFakeProductWithStringId(anyProduct))
      expect(products[1]).toEqual(makeFakeProductWithStringId(anotherProduct))
    })

    it('Should load empty list if no product was found', async () => {
      const sut = makeSut()
      const stringId1 = new ObjectId().toHexString()
      const stringId2 = new ObjectId().toHexString()
      const products = await sut.loadProductsByIds([stringId1, stringId2])
      expect(products.length).toBe(0)
    })

    it('Should load empty list if no Id provided', async () => {
      const sut = makeSut()
      const products = await sut.loadProductsByIds([])
      expect(products.length).toBe(0)
    })
  })
})
