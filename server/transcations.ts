import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import {Symbol} from '../imports/api/stocks'



Meteor.publish('recent-transcations', function (skip:number,limit:number) {
    return Transcation.find({
        userId: this.userId,
    }, { sort: { dateOfPurchase: -1 },skip:skip>0?skip:0,limit:limit })
})


interface TranscationSchema {
    ticket: string,
    userId: string,
    shares: number,
    action:string,
    priceAtPurchase: number,
    dateOfPurchase: Date
}

const Transcation = new Mongo.Collection<TranscationSchema>('transcations');
const isValidTicket = (ticket: string) => {
    return Symbol.find({ symbol: { '$regex': ticket, '$options': 'i' } }).count() > 0
}


export { Transcation }
Meteor.methods({
    //For Every Sell or BUY Transaction is called
    confirmTransaction(ticket: string, shares: number, stock_price: number,action:string) {
        if (this.userId) {
            if (!ticket || !isValidTicket(ticket) || shares < 1 || stock_price < 1) {
                return Meteor.Error
            }
            const newTranscation = {
                ticket,
                userId: this.userId,
                shares,
                action,
                priceAtPurchase: stock_price,
                dateOfPurchase: new Date()

            }
            Transcation.insert(newTranscation)
        }
    },
    getThisWeekTranscations(){
        if(this.userId){
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 5);

            return Transcation.find({userId:this.userId,dateOfPurchase: { $gte : startDate, $lt: endDate }}).fetch();
        }
        return [];
    },
    getTranscationCount(){
        if(this.userId){
            return Transcation.find({
                userId: this.userId,
            }).count()
        }
    }
})