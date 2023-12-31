import { User } from '@/domain/entities/user'
import type { Auth, AuthData, AuthResponse, AccessTokenBuilder } from '@/domain/usecases-contracts'
import { InvalidCredentialsError } from '@/domain/usecases-contracts/errors'
import type { HashComparer, LoadUserByEmailRepo, UpdateAccessTokenRepo } from '@/interactions/contracts'
import { left, right } from '@/shared/either'

export class AuthUseCase implements Auth {
  constructor (
    private readonly loadUserByEmailRepo: LoadUserByEmailRepo,
    private readonly hashComparer: HashComparer,
    private readonly accessTokenBuilder: AccessTokenBuilder,
    private readonly updateAccessTokenRepo: UpdateAccessTokenRepo
  ) {}

  async perform (data: AuthData): Promise<AuthResponse> {
    const { email, password } = data
    const emailOrError = User.validateEmail(email)
    if (emailOrError.isLeft()) {
      return left(emailOrError.value)
    }
    const user = await this.loadUserByEmailRepo.loadByEmail(email)
    if (!user) {
      return left(new InvalidCredentialsError())
    }
    const comparer = await this.hashComparer.comparer({
      value: password, hash: user.password
    })
    if (!comparer) {
      return left(new InvalidCredentialsError())
    }
    const { accessToken } = await this.accessTokenBuilder.perform(user.id)
    await this.updateAccessTokenRepo.updateAccessToken({
      userId: user.id,
      accessToken
    })
    return right({ accessToken })
  }
}
