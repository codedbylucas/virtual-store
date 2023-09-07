import type { AddProductToCartData } from '@/domain/usecases-contracts'
import { InvalidProductQuantityError, ProductNotFoundError } from '@/domain/usecases-contracts/errors'
import type { CreateCartRepo, CreateCartRepoData, Id, IdBuilder, LoadCartByUserIdRepo, LoadCartByUserIdRepoResponse, LoadProductByIdRepo } from '@/interactions/contracts'
import { AddProductToCartUseCase } from './add-product-to-cart-usecase'
import type { ProductModel } from '@/domain/models'

const makeFakeAddProductToCartData = (): AddProductToCartData => ({
  userId: 'any_user_id',
  productId: 'any_product_id',
  productQty: 2
})

const makeFakeProductModel = (): ProductModel => ({
  id: 'any_id',
  name: 'any name',
  amount: 10.90,
  description: 'any description'
})

const makeFakeLoadCartByUserIdRepoResponse = (): LoadCartByUserIdRepoResponse => ({
  id: 'any_id',
  userId: 'any_user_id',
  productIds: ['any_product_id_1', 'any_product_id_2']
})

const makeFakeCreateCartRepoData = (): CreateCartRepoData => ({
  id: 'any_id',
  userId: 'any_user_id',
  product: {
    id: 'any_product_id',
    quantity: 2
  }
})

const makeLoadProductByIdRepo = (): LoadProductByIdRepo => {
  class LoadProductByIdRepoStub implements LoadProductByIdRepo {
    async loadById (id: string): Promise<null | ProductModel> {
      return await Promise.resolve(makeFakeProductModel())
    }
  }
  return new LoadProductByIdRepoStub()
}

const makeLoadCartByUserIdRepo = (): LoadCartByUserIdRepo => {
  class LoadCartByUserIdRepoStub implements LoadCartByUserIdRepo {
    async loadByUserId (userId: string): Promise<null | LoadCartByUserIdRepoResponse> {
      return await Promise.resolve(makeFakeLoadCartByUserIdRepoResponse())
    }
  }
  return new LoadCartByUserIdRepoStub()
}

const makeIdBuilder = (): IdBuilder => {
  class IdBuilderStub implements IdBuilder {
    build (): Id {
      return { id: 'any_id' }
    }
  }
  return new IdBuilderStub()
}

const makeCreateCartRepo = (): CreateCartRepo => {
  class CreateCartRepoStub implements CreateCartRepo {
    async create (data: CreateCartRepoData): Promise<void> {
      await Promise.resolve()
    }
  }
  return new CreateCartRepoStub()
}

type SutTypes = {
  sut: AddProductToCartUseCase
  loadCartByUserIdRepoStub: LoadCartByUserIdRepo
  loadProductByIdRepoStub: LoadProductByIdRepo
  idBuilderStub: IdBuilder
  createCartRepoStub: CreateCartRepo
}

const makeSut = (): SutTypes => {
  const loadProductByIdRepoStub = makeLoadProductByIdRepo()
  const loadCartByUserIdRepoStub = makeLoadCartByUserIdRepo()
  const idBuilderStub = makeIdBuilder()
  const createCartRepoStub = makeCreateCartRepo()
  const sut = new AddProductToCartUseCase(
    loadProductByIdRepoStub, loadCartByUserIdRepoStub, idBuilderStub, createCartRepoStub
  )
  return {
    sut,
    loadProductByIdRepoStub,
    loadCartByUserIdRepoStub,
    idBuilderStub,
    createCartRepoStub
  }
}

describe('CartManager UseCase', () => {
  it('Should return InvalidProductQuantityError if productQty the less than 1', async () => {
    const { sut } = makeSut()
    const result = await sut.perform({
      userId: 'any_user_id',
      productId: 'any_product_id',
      productQty: 0
    })
    expect(result.value).toEqual(new InvalidProductQuantityError())
  })

  it('Should call LoadProductByIdRepo with correct product id', async () => {
    const { sut, loadProductByIdRepoStub } = makeSut()
    const loadByIdSpy = jest.spyOn(loadProductByIdRepoStub, 'loadById')
    await sut.perform(makeFakeAddProductToCartData())
    expect(loadByIdSpy).toHaveBeenCalledWith('any_product_id')
  })

  it('Should return ProductNotFoundError if LoadProductByIdRepo returns null', async () => {
    const { sut, loadProductByIdRepoStub } = makeSut()
    jest.spyOn(loadProductByIdRepoStub, 'loadById').mockReturnValueOnce(
      Promise.resolve(null)
    )
    const result = await sut.perform(makeFakeAddProductToCartData())
    expect(result.value).toEqual(new ProductNotFoundError('any_product_id'))
  })

  it('Should throw if LoadProductByIdRepo throws', async () => {
    const { sut, loadProductByIdRepoStub } = makeSut()
    jest.spyOn(loadProductByIdRepoStub, 'loadById').mockImplementation(() => {
      throw new Error()
    })
    const promise = sut.perform(makeFakeAddProductToCartData())
    await expect(promise).rejects.toThrow()
  })

  it('Should call LoadCartByUserIdRepo whith corret user id', async () => {
    const { sut, loadCartByUserIdRepoStub } = makeSut()
    const loadByUserIdSpy = jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId')
    await sut.perform(makeFakeAddProductToCartData())
    expect(loadByUserIdSpy).toHaveBeenCalledWith('any_user_id')
  })

  it('Should call IdBuilder if LoadCartByUserIdRepo returns null', async () => {
    const { sut, idBuilderStub, loadCartByUserIdRepoStub } = makeSut()
    const buildSpy = jest.spyOn(idBuilderStub, 'build')
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    await sut.perform(makeFakeAddProductToCartData())
    expect(buildSpy).toHaveBeenCalled()
  })

  it('Should call IdBuilder only once', async () => {
    const { sut, idBuilderStub, loadCartByUserIdRepoStub } = makeSut()
    const buildSpy = jest.spyOn(idBuilderStub, 'build')
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    await sut.perform(makeFakeAddProductToCartData())
    expect(buildSpy).toHaveBeenCalledTimes(1)
  })

  it('Should throw if IdBuilder throws', async () => {
    const { sut, idBuilderStub, loadCartByUserIdRepoStub } = makeSut()
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    jest.spyOn(idBuilderStub, 'build').mockImplementation(() => {
      throw new Error()
    })
    const promise = sut.perform(makeFakeAddProductToCartData())
    await expect(promise).rejects.toThrow()
  })

  it('Should call CreateCartRepo with correct values if LoadCartByUserIdRepo returns null', async () => {
    const { sut, createCartRepoStub, loadCartByUserIdRepoStub } = makeSut()
    const createSpy = jest.spyOn(createCartRepoStub, 'create')
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    await sut.perform(makeFakeAddProductToCartData())
    expect(createSpy).toHaveBeenCalledWith(makeFakeCreateCartRepoData())
  })

  it('Should call CreateCartRepo only once', async () => {
    const { sut, createCartRepoStub, loadCartByUserIdRepoStub } = makeSut()
    const buildSpy = jest.spyOn(createCartRepoStub, 'create')
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    await sut.perform(makeFakeAddProductToCartData())
    expect(buildSpy).toHaveBeenCalledTimes(1)
  })

  it('Should throw if CreateCartRepo throws', async () => {
    const { sut, createCartRepoStub, loadCartByUserIdRepoStub } = makeSut()
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    jest.spyOn(createCartRepoStub, 'create').mockImplementation(() => {
      throw new Error()
    })
    const promise = sut.perform(makeFakeAddProductToCartData())
    await expect(promise).rejects.toThrow()
  })

  it('Should return null if CreateCartRepo is a success', async () => {
    const { sut, loadCartByUserIdRepoStub } = makeSut()
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    const result = await sut.perform(makeFakeAddProductToCartData())
    expect(result.value).toBeNull()
  })
})
