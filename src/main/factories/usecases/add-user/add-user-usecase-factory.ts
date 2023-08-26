import type { AddUser } from '@/domain/usecases-contracts'
import { BcryptAdapter } from '@/external/criptography/bcrypt-adapter/bcrypt-adapter'
import { IdMongoBuilder } from '@/external/db/mongo-db/id/id-mongo-builder'
import { UserMongoRepo } from '@/external/db/mongo-db/user/user-mongo-repo'
import { AddUserUseCase } from '@/interactions/usecasess/add-user-usecase'
import { makeAccessTokenBuilderUseCase } from '../access-token-builder/access-token-builder-factory'

export const makeAddUserUseCase = (): AddUser => {
  const userMongoRepo = new UserMongoRepo()
  const salt = 12
  const bcryptAdapter = new BcryptAdapter(salt)
  const idMongoBuilder = new IdMongoBuilder()
  return new AddUserUseCase(
    userMongoRepo, bcryptAdapter, idMongoBuilder, makeAccessTokenBuilderUseCase(), userMongoRepo
  )
}