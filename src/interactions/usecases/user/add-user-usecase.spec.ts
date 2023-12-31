import { User, type UserData } from '@/domain/entities/user'
import { left } from '@/shared/either'
import type { LoadUserByEmailRepo, AddUserRepo, Id, IdBuilder, Hash, Hasher } from '@/interactions/contracts'
import { AddUserUseCase } from './add-user-usecase'
import type { AccessTokenBuilder } from '@/domain/usecases-contracts'
import { EmailInUseError } from '@/domain/usecases-contracts/errors'
import type { AccessTokenModel, UserModel } from '@/domain/models'

const makeFakeUserModel = (): UserModel => ({
  id: 'any_id',
  name: 'any name',
  email: 'any_email@mail.com',
  password: 'hashed_password',
  role: 'customer',
  accessToken: 'any_token'
})

const makeFakeUserData = (): UserData => ({
  name: 'any name',
  email: 'any_email@mail.com',
  password: 'abcd1234'
})

const makeLoadUserByEmailRepo = (): LoadUserByEmailRepo => {
  class LoadUserByEmailRepoStub implements LoadUserByEmailRepo {
    async loadByEmail (email: string): Promise<null | UserModel> {
      return await Promise.resolve(null)
    }
  }
  return new LoadUserByEmailRepoStub()
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hashing (value: string): Promise<Hash> {
      return await Promise.resolve({ hash: 'hashed_password' })
    }
  }
  return new HasherStub()
}

const makeIdBuilder = (): IdBuilder => {
  class IdBuilderStub implements IdBuilder {
    build (): Id {
      return { id: 'any_id' }
    }
  }
  return new IdBuilderStub()
}

const makeAccessTokenBuilder = (): AccessTokenBuilder => {
  class AccessTokenBuilderStub implements AccessTokenBuilder {
    async perform (value: string): Promise<AccessTokenModel> {
      return { accessToken: 'any_token' }
    }
  }
  return new AccessTokenBuilderStub()
}

const makeAddUserRepo = (): AddUserRepo => {
  class AddUserRepoStub implements AddUserRepo {
    async add (data: UserModel): Promise<void> {
      await Promise.resolve()
    }
  }
  return new AddUserRepoStub()
}

type SutTypes = {
  sut: AddUserUseCase
  loadUserByEmailRepoStub: LoadUserByEmailRepo
  hasherStub: Hasher
  idBuilderStub: IdBuilder
  accessTokenBuilderStub: AccessTokenBuilder
  addUserRepoStub: AddUserRepo
}

const makeSut = (): SutTypes => {
  const loadUserByEmailRepoStub = makeLoadUserByEmailRepo()
  const hasherStub = makeHasher()
  const idBuilderStub = makeIdBuilder()
  const accessTokenBuilderStub = makeAccessTokenBuilder()
  const addUserRepoStub = makeAddUserRepo()
  const sut = new AddUserUseCase(
    loadUserByEmailRepoStub, hasherStub, idBuilderStub, accessTokenBuilderStub, addUserRepoStub
  )
  return {
    sut,
    loadUserByEmailRepoStub,
    hasherStub,
    idBuilderStub,
    accessTokenBuilderStub,
    addUserRepoStub
  }
}

describe('AddUser UseCase', () => {
  it('Should call User Entity with correct values', async () => {
    const { sut } = makeSut()
    const createSpy = jest.spyOn(User, 'create')
    await sut.perform(makeFakeUserData())
    expect(createSpy).toHaveBeenCalledWith(makeFakeUserData())
  })

  it('Should return a Error if create User fails', async () => {
    const { sut } = makeSut()
    jest.spyOn(User, 'create').mockReturnValueOnce(
      left(new Error('any message'))
    )
    const result = await sut.perform(makeFakeUserData())
    expect(result.value).toEqual(new Error('any message'))
  })

  it('Should call LoadUserByEmailRepo with correct email', async () => {
    const { sut, loadUserByEmailRepoStub } = makeSut()
    const loadByEmailSpy = jest.spyOn(loadUserByEmailRepoStub, 'loadByEmail')
    await sut.perform(makeFakeUserData())
    expect(loadByEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })

  it('Should return EmailInUseError if LoadUserByEmailRepo return a UserModel', async () => {
    const { sut, loadUserByEmailRepoStub } = makeSut()
    jest.spyOn(loadUserByEmailRepoStub, 'loadByEmail').mockReturnValueOnce(
      Promise.resolve(makeFakeUserModel())
    )
    const result = await sut.perform(makeFakeUserData())
    expect(result.value).toEqual(new EmailInUseError('any_email@mail.com'))
  })

  it('Should throw if LoadUserByEmailRepo throws', async () => {
    const { sut, loadUserByEmailRepoStub } = makeSut()
    jest.spyOn(loadUserByEmailRepoStub, 'loadByEmail').mockReturnValueOnce(
      Promise.reject(new Error())
    )
    const promise = sut.perform(makeFakeUserData())
    await expect(promise).rejects.toThrow()
  })

  it('Should call Hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hashingSpy = jest.spyOn(hasherStub, 'hashing')
    await sut.perform(makeFakeUserData())
    expect(hashingSpy).toHaveBeenCalledWith('abcd1234')
  })

  it('Should throw if Hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hashing').mockReturnValueOnce(
      Promise.reject(new Error())
    )
    const promise = sut.perform(makeFakeUserData())
    await expect(promise).rejects.toThrow()
  })

  it('Should call IdBuilder', async () => {
    const { sut, idBuilderStub } = makeSut()
    const buildSpy = jest.spyOn(idBuilderStub, 'build')
    await sut.perform(makeFakeUserData())
    expect(buildSpy).toHaveBeenCalled()
  })

  it('Should throw if IdBuilder throws', async () => {
    const { sut, idBuilderStub } = makeSut()
    jest.spyOn(idBuilderStub, 'build').mockImplementation(() => {
      throw new Error()
    })
    const promise = sut.perform(makeFakeUserData())
    await expect(promise).rejects.toThrow()
  })

  it('Should call AccessTokenBuilder with correct Id', async () => {
    const { sut, accessTokenBuilderStub } = makeSut()
    const buildSpy = jest.spyOn(accessTokenBuilderStub, 'perform')
    await sut.perform(makeFakeUserData())
    expect(buildSpy).toHaveBeenCalledWith('any_id')
  })

  it('Should throw if AccessTokenBuilder throws', async () => {
    const { sut, accessTokenBuilderStub } = makeSut()
    jest.spyOn(accessTokenBuilderStub, 'perform').mockImplementation(() => {
      throw new Error()
    })
    const promise = sut.perform(makeFakeUserData())
    await expect(promise).rejects.toThrow()
  })

  it('Should call AddUserRepo with UserModel', async () => {
    const { sut, addUserRepoStub } = makeSut()
    const addSpy = jest.spyOn(addUserRepoStub, 'add')
    await sut.perform(makeFakeUserData())
    expect(addSpy).toHaveBeenCalledWith(makeFakeUserModel())
  })

  it('Should throw if AddUserRepo throws', async () => {
    const { sut, addUserRepoStub } = makeSut()
    jest.spyOn(addUserRepoStub, 'add').mockReturnValueOnce(
      Promise.reject(new Error())
    )
    const promise = sut.perform(makeFakeUserData())
    await expect(promise).rejects.toThrow()
  })

  it('Should return access token if perform success', async () => {
    const { sut } = makeSut()
    const result = await sut.perform(makeFakeUserData())
    expect(result.value).toEqual({ accessToken: 'any_token' })
  })
})
