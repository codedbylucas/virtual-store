import { type Either, right, left } from '@/shared/either'
import type { Validation } from '@/presentation/contracts/validation'
import type { HttpRequest } from '@/presentation/http-types/http'
import { SignUpController } from './signup-controller'
import { badRequest, created, serverError } from '@/presentation/helpers/http/http-helpers'
import type { AddUserResponse, AddUser } from '@/domain/usecases-contracts'
import type { UserData } from '@/domain/entities/user'
import { ServerError } from '@/presentation/errors/server-error'

const makeFakeRequest = (): HttpRequest => ({
  body: {
    name: 'any name',
    email: 'any_email@mail.com',
    password: 'abcd1234',
    passwordConfirmation: 'abcd1234'
  }
})

const makeValidationComposite = (): Validation => {
  class ValidationCompositeStub implements Validation {
    validate (input: any): Either<Error, null> {
      return right(null)
    }
  }
  return new ValidationCompositeStub()
}

const makeAddUser = (): AddUser => {
  class AddUserStub implements AddUser {
    async perform (account: UserData): Promise<AddUserResponse> {
      return await Promise.resolve(right({ accessToken: 'any_token' }))
    }
  }
  return new AddUserStub()
}

type SutTypes = {
  sut: SignUpController
  validationCompositeStub: Validation
  addUserStub: AddUser
}

const makeSut = (): SutTypes => {
  const validationCompositeStub = makeValidationComposite()
  const addUserStub = makeAddUser()
  const sut = new SignUpController(validationCompositeStub, addUserStub)
  return {
    sut,
    validationCompositeStub,
    addUserStub
  }
}

describe('SignUp Controller', () => {
  it('Should call ValidationComposite with correct values', async () => {
    const { sut, validationCompositeStub } = makeSut()
    const validateSpy = jest.spyOn(validationCompositeStub, 'validate')
    await sut.handle(makeFakeRequest())
    expect(validateSpy).toHaveBeenCalledWith(makeFakeRequest().body)
  })

  it('Should return 400 if ValidationComposite fails', async () => {
    const { sut, validationCompositeStub } = makeSut()
    jest.spyOn(validationCompositeStub, 'validate').mockReturnValueOnce(
      left(new Error('any_message'))
    )
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new Error('any_message')))
  })

  it('Should return 500 if ValidationComposite throws', async () => {
    const { sut, validationCompositeStub } = makeSut()
    jest.spyOn(validationCompositeStub, 'validate').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    const error = new Error()
    expect(httpResponse).toEqual(serverError(new ServerError(error.stack)))
  })

  it('Should call AddUser with correct values', async () => {
    const { sut, addUserStub } = makeSut()
    const performSpy = jest.spyOn(addUserStub, 'perform')
    await sut.handle(makeFakeRequest())
    expect(performSpy).toHaveBeenCalledWith({
      name: 'any name',
      email: 'any_email@mail.com',
      password: 'abcd1234'
    })
  })

  it('Should return 400 if AddUser fails', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'perform').mockReturnValueOnce(
      Promise.resolve(left(new Error('any_message')))
    )
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new Error('any_message')))
  })

  it('Should return 500 if AddUser throws', async () => {
    const { sut, addUserStub } = makeSut()
    jest.spyOn(addUserStub, 'perform').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpResponse = await sut.handle(makeFakeRequest())
    const error = new Error()
    expect(httpResponse).toEqual(serverError(new ServerError(error.stack)))
  })

  it('Should return 201 if AddUser success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(created({ accessToken: 'any_token' }))
  })
})
