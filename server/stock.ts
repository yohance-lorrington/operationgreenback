import SimpleSchema from 'simpl-schema';
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { CustomUser } from './accounts';

import {Stock, StockSchema} from '../imports/api/stocks'


// Meteor.publish('user-stock-list', function () {
//     const userObject = Meteor.users.findOne({_id:this.userId});
//     if(userObject){
//         const stockList = (userObject as CustomUser).stockList;
//         return  Stock.find({ _id: { $in: stockList }}, { fields: { ticket: 1, shares: 1 }, sort: { lastUpdate: -1 } })
//     }else{
//         this.stop();
//     }
   
// })
Meteor.publish('user-stock-pagination', function (skip: number, limit: number) {
    if (this.userId) {
        return Stock.find({ userId: this.userId }, { skip: skip > 0 ? skip : 0, limit: limit, sort: { lastUpdate: -1 } })
    }
    else {
        this.stop()
    }


})
const canAfford = (captial: number, share: number, price: number) => {
    return captial > Math.ceil(share * price)
}
const calculateRemainCaptialBuying = (captial: number, share: number, price: number) => {
    if (canAfford(captial, share, price)) {
        return captial - (share * price);
    }
    return 0;
}
const calculateRemainCaptialSelling = (captial: number, share: number, price: number) => {

    return captial + (share * price);

}
const updateUserStockList=(userId:string,unqiStockId:string)=>{
    const userObject = Meteor.users.findOne({_id:userId});
    if(userObject){
        const prevUserlist = (userObject as CustomUser).stockList;
        const newList= [...prevUserlist,unqiStockId];
        Meteor.users.update({_id:userId},{$set:{stockList:newList}});

    }
}
const removeStockFromList=(userId:string,unqiStockId:string)=>{
    const userObject = Meteor.users.findOne({_id:userId});
    if(userObject){
        const prevUserlist = (userObject as CustomUser).stockList;
        const newList=prevUserlist.filter((elm)=>elm!==unqiStockId);
        Meteor.users.update({_id:userId},{$set:{stockList:newList}});

    }
}
const updateStock = (ticket: string, shares: number, userId: string) => {
    if (userId) {
        const foundDoc = Stock.findOne({ ticket: ticket, userId: userId });
        if (foundDoc) {
            if (shares < 1) {
                Stock.remove({ _id: foundDoc._id });
                removeStockFromList(userId, foundDoc._id);
            } else {
                Stock.update({ _id: (foundDoc as any)._id }, { $set: { shares: shares, lastUpdate: new Date() } })
            }
        } else {
            const newStock = {
                ticket,
                shares,
                userId: userId,
                lastUpdate: new Date(),
            }
            Stock.insert(newStock,(err:any,newDocId:string)=>{
                if(!err){
                    updateUserStockList(userId,newDocId);
                }
            })

        }
    }

}

const returnOwnShares = (userId: string, ticket: string) => {
    const prevOwnStock = Stock.findOne({ ticket: ticket, userId: userId });
    if (prevOwnStock) {
        return prevOwnStock.shares;
    }
    return 0;
}

Meteor.methods({
    getSharesofStock(ticket:string){
        if(this.userId){
            return returnOwnShares(this.userId,ticket)
        }
        return 0;
    },
    getUserStockList() {
        if (this.userId) {
            const stocklist = Stock.find({ userId: this.userId },{sort: { lastUpdate: -1 } }).fetch();
            return stocklist
        }return[]


    },
    buyStock(ticket: string, shares: number, price: number) {
        if (this.userId) {
            const user = Meteor.users.findOne({ _id: this.userId });

            if (user) {
                const customUser = user as CustomUser;
                const sharesU = returnOwnShares(this.userId, ticket);
                if (shares > 0) {
                    if (canAfford(customUser.capital, shares, price)) {
                        const remainingCapital = calculateRemainCaptialBuying(customUser.capital, shares, price);
                        updateStock(ticket, shares + sharesU, this.userId)
                        Meteor.users.update({ _id: user._id }, { $set: { capital: remainingCapital } })
                        Meteor.call('confirmTransaction', ticket, shares, price, 'BUY')
                    }else{
                        return {
                            cantAfford:true
                        }
                    }
                }else{
                    return {
                        stockLessThanZero:true
                    }
                }


            }
        }
    },
    sellStock(ticket: string, shares: number, price: number) {
        if (this.userId) {
            const user = Meteor.users.findOne({ _id: this.userId });
            if (user) {
                const customUser = user as CustomUser;
                const sharesU = returnOwnShares(this.userId, ticket);
                if (sharesU >= shares && shares > 0) {
                    const remainingCapital = calculateRemainCaptialSelling(customUser.capital, shares, price);
                    updateStock(ticket, sharesU - shares, this.userId)
                    Meteor.users.update({ _id: user._id }, { $set: { capital: remainingCapital } })
                    Meteor.call('confirmTransaction', ticket, shares, price, 'SELL')
                }else{
                    return {
                        dontOwnStok:true
                    }
                }


            }
        }
    },
    getStocksOwn() {
        if (this.userId) {
            return Stock.find({ userId: this.userId }).count();
        }
    }
})