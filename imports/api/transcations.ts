import { Mongo } from "meteor/mongo";

export interface TranscationSchema {
    ticket: string,
    userId: string,
    shares: number,
    action:string,
    priceAtPurchase: number,
    dateOfPurchase: Date
}

export const Transcation = new Mongo.Collection<TranscationSchema>('transcations');