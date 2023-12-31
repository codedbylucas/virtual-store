import type { CartModel, ProductModel } from '@/domain/models'
import type { AddProductToCartData, LoadProductById, LoadProductByIdResponse } from '@/domain/usecases-contracts'
import { InvalidProductQuantityError, ProductNotFoundError } from '@/domain/usecases-contracts/errors'
import type { AddProductToCartRepo, AddProductToCartRepoData, CreateCartRepo, CreateCartRepoData, Id, IdBuilder, LoadCartByUserIdRepo, UpdateProductQtyCartRepo, UpdateProductQtyCartRepoData } from '@/interactions/contracts'
import { left, right } from '@/shared/either'
import { AddProductToCartUseCase } from './add-product-to-cart-usecase'

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

const makeFakeCartModel = (): CartModel => ({
  id: 'any_id',
  userId: 'any_user_id',
  products: [{
    id: 'any_product_id_1',
    quantity: 1
  }, {
    id: 'any_product_id_2',
    quantity: 2
  }]
})

const makeFakeCreateCartRepoData = (): CreateCartRepoData => ({
  id: 'any_id',
  userId: 'any_user_id',
  product: {
    id: 'any_product_id',
    quantity: 2
  }
})

const makeFakeAddProductToCartRepoData = (): AddProductToCartRepoData => ({
  id: 'any_id',
  product: {
    id: 'any_product_id',
    quantity: 2
  }
})

const makeLoadProductById = (): LoadProductById => {
  class LoadProductByIdStub implements LoadProductById {
    async perform (peoductId: string): Promise<LoadProductByIdResponse> {
      return await Promise.resolve(right(makeFakeProductModel()))
    }
  }
  return new LoadProductByIdStub()
}

const makeLoadCartByUserIdRepo = (): LoadCartByUserIdRepo => {
  class LoadCartByUserIdRepoStub implements LoadCartByUserIdRepo {
    async loadByUserId (userId: string): Promise<null | CartModel> {
      return await Promise.resolve(makeFakeCartModel())
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

const makeUpdateProductQtyCartRepo = (): UpdateProductQtyCartRepo => {
  class UpdateProductQtyCartRepoStub implements UpdateProductQtyCartRepo {
    async updateProductQty (data: UpdateProductQtyCartRepoData): Promise<void> {
      await Promise.resolve()
    }
  }
  return new UpdateProductQtyCartRepoStub()
}

const makeAddProductToCartRepo = (): AddProductToCartRepo => {
  class AddProductToCartRepoStub implements AddProductToCartRepo {
    async addProduct (data: AddProductToCartRepoData): Promise<void> {
      await Promise.resolve()
    }
  }
  return new AddProductToCartRepoStub()
}

type SutTypes = {
  sut: AddProductToCartUseCase
  loadProductByIdStub: LoadProductById
  loadCartByUserIdRepoStub: LoadCartByUserIdRepo
  idBuilderStub: IdBuilder
  createCartRepoStub: CreateCartRepo
  updateProductQtyCartRepoStub: UpdateProductQtyCartRepo
  addProductToCartRepoStub: AddProductToCartRepo
}

const makeSut = (): SutTypes => {
  const loadProductByIdStub = makeLoadProductById()
  const loadCartByUserIdRepoStub = makeLoadCartByUserIdRepo()
  const idBuilderStub = makeIdBuilder()
  const createCartRepoStub = makeCreateCartRepo()
  const updateProductQtyCartRepoStub = makeUpdateProductQtyCartRepo()
  const addProductToCartRepoStub = makeAddProductToCartRepo()
  const sut = new AddProductToCartUseCase(
    loadProductByIdStub,
    loadCartByUserIdRepoStub,
    idBuilderStub,
    createCartRepoStub,
    updateProductQtyCartRepoStub,
    addProductToCartRepoStub
  )
  return {
    sut,
    loadProductByIdStub,
    loadCartByUserIdRepoStub,
    idBuilderStub,
    createCartRepoStub,
    updateProductQtyCartRepoStub,
    addProductToCartRepoStub
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

  it('Should call LoadProductById with correct product id', async () => {
    const { sut, loadProductByIdStub } = makeSut()
    const loadProductSpy = jest.spyOn(loadProductByIdStub, 'perform')
    await sut.perform(makeFakeAddProductToCartData())
    expect(loadProductSpy).toHaveBeenCalledWith('any_product_id')
  })

  it('Should return ProductNotFoundError if LoadProductById returns ProductNotFoundError', async () => {
    const { sut, loadProductByIdStub } = makeSut()
    jest.spyOn(loadProductByIdStub, 'perform').mockReturnValueOnce(
      Promise.resolve(left(new ProductNotFoundError('any_product_id')))
    )
    const result = await sut.perform(makeFakeAddProductToCartData())
    expect(result.value).toEqual(new ProductNotFoundError('any_product_id'))
  })

  it('Should throw if LoadProductById throws', async () => {
    const { sut, loadProductByIdStub } = makeSut()
    jest.spyOn(loadProductByIdStub, 'perform').mockImplementation(() => {
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

  it('Should throw if LoadCartByUserIdRepo throws', async () => {
    const { sut, loadCartByUserIdRepoStub } = makeSut()
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockImplementation(() => {
      throw new Error()
    })
    const promise = sut.perform(makeFakeAddProductToCartData())
    await expect(promise).rejects.toThrow()
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
    const createSpy = jest.spyOn(createCartRepoStub, 'create')
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    await sut.perform(makeFakeAddProductToCartData())
    expect(createSpy).toHaveBeenCalledTimes(1)
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

  it('Should call UpdateProductQtyCartRepo if the product already exists in the cart and must increment the quantity', async () => {
    const { sut, loadCartByUserIdRepoStub, updateProductQtyCartRepoStub } = makeSut()
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve({
        id: 'any_id',
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id_2',
          quantity: 1
        }, {
          id: 'any_product_id',
          quantity: 2
        }]
      })
    )
    const updateProductQtySpy = jest.spyOn(updateProductQtyCartRepoStub, 'updateProductQty')
    await sut.perform(makeFakeAddProductToCartData())
    expect(updateProductQtySpy).toHaveBeenCalledWith({
      id: 'any_id',
      product: {
        id: 'any_product_id',
        quantity: 4
      }
    })
  })

  it('Should call UpdateProductQtyCartRepo only once', async () => {
    const { sut, loadCartByUserIdRepoStub, updateProductQtyCartRepoStub } = makeSut()
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve({
        id: 'any_id',
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id',
          quantity: 1
        }, {
          id: 'any_product_id',
          quantity: 2
        }]
      })
    )
    const updateProductQtySpy = jest.spyOn(updateProductQtyCartRepoStub, 'updateProductQty')
    await sut.perform(makeFakeAddProductToCartData())
    expect(updateProductQtySpy).toHaveBeenCalledTimes(1)
  })

  it('Should call UpdateProductQtyCartRepo and return null if UpdateProductQtyCartRepo is a success', async () => {
    const { sut, loadCartByUserIdRepoStub, updateProductQtyCartRepoStub } = makeSut()
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve({
        id: 'any_id',
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id_2',
          quantity: 1
        }, {
          id: 'any_product_id',
          quantity: 2
        }]
      })
    )
    const updateProductQtySpy = jest.spyOn(updateProductQtyCartRepoStub, 'updateProductQty')
    const result = await sut.perform(makeFakeAddProductToCartData())
    expect(updateProductQtySpy).toHaveBeenCalledWith({
      id: 'any_id',
      product: {
        id: 'any_product_id',
        quantity: 4
      }
    })
    expect(result.value).toBeNull()
  })

  it('Should throw if UpdateProductQtyCartRepo throws', async () => {
    const { sut, updateProductQtyCartRepoStub, loadCartByUserIdRepoStub } = makeSut()
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve({
        id: 'any_id',
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id',
          quantity: 2
        }]
      })
    )
    jest.spyOn(updateProductQtyCartRepoStub, 'updateProductQty').mockImplementation(() => {
      throw new Error()
    })
    const promise = sut.perform(makeFakeAddProductToCartData())
    await expect(promise).rejects.toThrow()
  })

  it('Should call AddProductToCartRepo with correct values', async () => {
    const { sut, addProductToCartRepoStub } = makeSut()
    const addProductSpy = jest.spyOn(addProductToCartRepoStub, 'addProduct')
    await sut.perform(makeFakeAddProductToCartData())
    expect(addProductSpy).toHaveBeenLastCalledWith(makeFakeAddProductToCartRepoData())
  })

  it('Should call AddProductToCartRepo only once', async () => {
    const { sut, addProductToCartRepoStub } = makeSut()
    const addProductSpy = jest.spyOn(addProductToCartRepoStub, 'addProduct')
    await sut.perform(makeFakeAddProductToCartData())
    expect(addProductSpy).toHaveBeenCalledTimes(1)
  })

  it('Should throw if AddProductToCartRepo throws', async () => {
    const { sut, addProductToCartRepoStub } = makeSut()
    jest.spyOn(addProductToCartRepoStub, 'addProduct').mockImplementation(() => {
      throw new Error()
    })
    const promise = sut.perform(makeFakeAddProductToCartData())
    await expect(promise).rejects.toThrow()
  })

  it('Should call CreateCartRepo and not call AddProductToCartRepo and UpdateProductQtyCartRepo', async () => {
    const { sut, createCartRepoStub, loadCartByUserIdRepoStub, updateProductQtyCartRepoStub, addProductToCartRepoStub } = makeSut()
    const createSpy = jest.spyOn(createCartRepoStub, 'create')
    const updateProductQtySpy = jest.spyOn(updateProductQtyCartRepoStub, 'updateProductQty')
    const addProductSpy = jest.spyOn(addProductToCartRepoStub, 'addProduct')
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve(null)
    )
    await sut.perform(makeFakeAddProductToCartData())
    expect(createSpy).toHaveBeenCalled()
    expect(updateProductQtySpy).not.toHaveBeenCalled()
    expect(addProductSpy).not.toHaveBeenCalled()
  })

  it('Should call AddProductToCartRepo and not call CreateCartRepo and UpdateProductQtyCartRepo', async () => {
    const { sut, createCartRepoStub, updateProductQtyCartRepoStub, addProductToCartRepoStub } = makeSut()
    const createSpy = jest.spyOn(createCartRepoStub, 'create')
    const updateProductQtySpy = jest.spyOn(updateProductQtyCartRepoStub, 'updateProductQty')
    const addProductSpy = jest.spyOn(addProductToCartRepoStub, 'addProduct')
    await sut.perform(makeFakeAddProductToCartData())
    expect(addProductSpy).toHaveBeenCalled()
    expect(createSpy).not.toHaveBeenCalled()
    expect(updateProductQtySpy).not.toHaveBeenCalled()
  })

  it('Should call UpdateProductQtyCartRepo and not call CreateCartRepo and AddProductToCartRepo', async () => {
    const { sut, loadCartByUserIdRepoStub, createCartRepoStub, updateProductQtyCartRepoStub, addProductToCartRepoStub } = makeSut()
    const createSpy = jest.spyOn(createCartRepoStub, 'create')
    const updateProductQtySpy = jest.spyOn(updateProductQtyCartRepoStub, 'updateProductQty')
    const addProductSpy = jest.spyOn(addProductToCartRepoStub, 'addProduct')
    jest.spyOn(loadCartByUserIdRepoStub, 'loadByUserId').mockReturnValueOnce(
      Promise.resolve({
        id: 'any_id',
        userId: 'any_user_id',
        products: [{
          id: 'any_product_id',
          quantity: 2
        }]
      })
    )
    await sut.perform(makeFakeAddProductToCartData())
    expect(updateProductQtySpy).toHaveBeenCalled()
    expect(createSpy).not.toHaveBeenCalled()
    expect(addProductSpy).not.toHaveBeenCalled()
  })

  it('Should return null if AddProductToCartRepo is a success', async () => {
    const { sut } = makeSut()
    const result = await sut.perform(makeFakeAddProductToCartData())
    expect(result.value).toBeNull()
  })
})
