import { AccessDeniedError, InvalidTokenError } from '@/domain/usecases-contracts/errors'
import type { AccessControl, AccessControlData, AccessControlResponse } from '@/domain/usecases-contracts'
import type { Decrypter, LoadUserByIdRepo } from '@/interactions/contracts'
import { left, right } from '@/shared/either'

export class AccessControlUseCase implements AccessControl {
  constructor (
    private readonly decrypter: Decrypter,
    private readonly loadUserByIdRepo: LoadUserByIdRepo
  ) {}

  async perform (data: AccessControlData): Promise<AccessControlResponse> {
    const id = await this.decrypter.decrypt(data.accessToken)
    if (!id) {
      return left(new InvalidTokenError())
    }
    const user = await this.loadUserByIdRepo.loadById(id)
    if (!user) {
      return left(new AccessDeniedError())
    }
    if (data.role === 'admin' && user.role !== 'admin') {
      return left(new AccessDeniedError())
    }
    return right({ userId: user.id })
  }
}
