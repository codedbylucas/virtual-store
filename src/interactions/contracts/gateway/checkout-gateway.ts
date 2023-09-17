import type { CompleteCartModel } from '@/domain/models'

export type CheckoutGatewayResponse = {
  url: string
}

export type CheckoutGatewayData = CompleteCartModel & {
  userId: string
  userEmail: string
  purchaseIntentId: string
}

export interface CheckoutGateway {
  payment: (data: CheckoutGatewayData) => Promise<null | CheckoutGatewayResponse>
}
