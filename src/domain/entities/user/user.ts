import { left, right } from '@/shared/either'
import type { UserData, CreateUserResponse, ValidateEmailResponse } from '.'
import { Email, Name, Password } from './value-objects'

export class User {
  private constructor (
    private readonly name: Name,
    private readonly email: Email,
    private readonly password: Password
  ) {}

  static create (data: UserData): CreateUserResponse {
    const name = Name.create(data.name)
    if (name.isLeft()) {
      return left(name.value)
    }
    const email = Email.create(data.email)
    if (email.isLeft()) {
      return left(email.value)
    }
    const password = Password.create(data.password)
    if (password.isLeft()) {
      return left(password.value)
    }
    return right(
      new User(name.value, email.value, password.value)
    )
  }

  static validateEmail (email: string): ValidateEmailResponse {
    const emailOrError = Email.create(email)
    if (emailOrError.isLeft()) {
      return left(emailOrError.value)
    }
    return right(emailOrError.value)
  }
}
