import { Mongo } from "meteor/mongo";
import axios from 'axios'
const IEX_TOKEN = 'pk_104b0734c0614d12844b2585eb3d3400'
export interface StockSchema {
    _id:string,
    ticket: string,
    shares: number,
    userId: string,
    lastUpdate:Date

}
export const Stock = new Mongo.Collection<StockSchema>('stocks')

export interface SymbolProps{
    symbol:string,
    name:string,
    date:string,
    type:string,
    iexId:string,
    region:string,
    currency:string,
    isEnabled:string,
    figi:boolean,
    cik:string
}
export const Symbol = new Mongo.Collection<SymbolProps>('symbols');

export const iexAPI = axios.create({
    baseURL: 'https://cloud.iexapis.com/stable',
})

export const getCurrentPriceIEX = (ticket:string)=>{
   return iexAPI.get<number>(`/stock/${ticket}/quote/latestPrice?token=${IEX_TOKEN}`)
}
export const getTicketQuote=(ticket:string)=>{
    return iexAPI.get(`/stock/${ticket}/quote?token=${IEX_TOKEN}`)
}

export const getTicketBatchQuote=(tickets:string[])=>{
    
    return iexAPI.get(`/stock/market/batch?symbols=${tickets.join(',')}&types=quote&token=${IEX_TOKEN}`)
}

export const getTicketBatchQuoteChart=(tickets:string[])=>{
    
    return iexAPI.get(`/stock/market/batch?symbols=${tickets.join(',')}&types=quote,chart&range=5d&token=${IEX_TOKEN}`)
}