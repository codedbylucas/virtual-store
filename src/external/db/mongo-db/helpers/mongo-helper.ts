import { MongoClient, ObjectId, type Collection } from 'mongodb'

export const MongoHelper = {
  client: null as unknown as MongoClient | null,
  uri: null as unknown as string,

  async connect (uri: string | undefined): Promise<void> {
    if (!uri) {
      this.uri = 'mongodb://127.0.0.1:27017/virtual-store'
    } else {
      this.uri = uri
    }
    this.client = await MongoClient.connect(this.uri)
    console.log(`MongoDB running at ${this.uri}`)
  },

  async disconnect (): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
    }
  },

  async getCollection (name: string): Promise<Collection> {
    if (!this.client?.db) {
      this.client = await MongoClient.connect(this.uri)
    }
    return this.client.db().collection(name)
  },

  convertCollectionIdStringToObjectId (collection: any): any {
    if (!collection || Object.keys(collection).length === 0 || !collection.id) {
      return null
    }
    const { id, ...collectionWithoutId } = collection
    return { ...collectionWithoutId, _id: new ObjectId(id) }
  },

  convertCollectionIdObjectIdToString (collection: any): any {
    if (!collection || Object.keys(collection).length === 0 || !collection._id) {
      return null
    }
    const { _id, ...collectionWithoutId } = collection
    return Object.assign({}, collectionWithoutId, { id: _id.toHexString() })
  },

  transformIdInObjectId (id: string): ObjectId {
    return new ObjectId(id)
  },

  createObjectId (): ObjectId {
    return new ObjectId()
  }
}
