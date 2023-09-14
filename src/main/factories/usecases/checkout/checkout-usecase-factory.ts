import type { Checkout } from '@/domain/usecases-contracts'
import { StripeAdapter } from '@/external/gateway/stripe/stripe-adapter'
import { CheckoutUseCase } from '@/interactions/usecases/checkout'
import { makeLoadCartUseCase } from '../cart'
import { UserMongoRepo } from '@/external/db/mongo-db/user/user-mongo-repo'

export const makeCheckoutUseCase = (): Checkout => {
  const userMongoRepo = new UserMongoRepo()
  const stripeAdapter = new StripeAdapter()
  return new CheckoutUseCase(makeLoadCartUseCase(), userMongoRepo, stripeAdapter)
}