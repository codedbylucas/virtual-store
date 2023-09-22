export type ProductOfPurchaseIntentModel = {
  id: string
  name: string
  amount: number
  quantity: number
}

export type PurchaseIntentModel = {
  id: string
  userId: string
  orderCode: string
  createdAt: Date
  updatedAt: Date
  products: ProductOfPurchaseIntentModel[]
}
