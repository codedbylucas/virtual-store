import type { Token, Encrypter, EncrypterData } from '../contracts'
import { AccessTokenBuilderUseCase } from './access-token-builder-usecase'

const makeAccessTokenEncrypterStub = (): Encrypter => {
  class AccessTokenEcrypterStub implements Encrypter {
    async encrypt (data: EncrypterData): Promise<Token> {
      return { token: 'any_token' }
    }
  }
  return new AccessTokenEcrypterStub()
}

const makeFakeEncrypterData = (): EncrypterData => ({
  value: 'any_value',
  expiresInHours: 24
})

type SutTypes = {
  sut: AccessTokenBuilderUseCase
  encrypterStub: Encrypter
}

const makeSut = (): SutTypes => {
  const encrypterStub = makeAccessTokenEncrypterStub()
  const sut = new AccessTokenBuilderUseCase(encrypterStub)
  return {
    sut,
    encrypterStub
  }
}

describe('AccessTokenBuilder UseCase', () => {
  it('Should call Ecrypter with correct values', async () => {
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    await sut.perform('any_value')
    expect(encryptSpy).toHaveBeenCalledWith(makeFakeEncrypterData())
  })

  it('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
      Promise.reject(new Error())
    )
    const promise = sut.perform('any_value')
    await expect(promise).rejects.toThrow()
  })

  it('Should return AccessToken if Encrypter success', async () => {
    const { sut } = makeSut()
    const result = await sut.perform('any_value')
    expect(result).toEqual({ accessToken: 'any_token' })
  })
})
