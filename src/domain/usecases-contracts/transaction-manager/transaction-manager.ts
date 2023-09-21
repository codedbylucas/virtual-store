import type { Either } from '@/shared/either'
import type { EventNotProcessError, GatewayIncompatibilityError, UserNotFoundError } from '../errors'

export type TransactionManagerData = {
  signature: string
  payload: any
}

export type TransactionEventType = 'PaymentSuccess' | 'PaymentFailure'

export type TransactionEventData = {
  userId: string
  userName: string
  userEmail: string
  purchaseIntentId: string
}

export type TransactionManagerResponse = Either<
GatewayIncompatibilityError | EventNotProcessError | UserNotFoundError, null
>

export interface TransactionManager {
  perform: (data: TransactionManagerData) => Promise<TransactionManagerResponse>
}
