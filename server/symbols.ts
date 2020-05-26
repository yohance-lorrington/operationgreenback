import { Mongo } from "meteor/mongo";

import {iexAPI,Symbol,SymbolProps} from '../imports/api/stocks'
import { Meteor } from "meteor/meteor";



Meteor.methods({
    findSymbol(symbolOrTicket:string){
        // console.log(symbolOrTicket)
           return Symbol.find({$or:[{symbol:{'$regex':symbolOrTicket,'$options':'i'}},{name:{'$regex':symbolOrTicket,'$options':'i'}}]},{limit: 10}).fetch();
        },
})
Symbol.rawCollection().estimatedDocumentCount().then((count)=>{
    if(count<1){
        const unorderBulk = Symbol.rawCollection().initializeUnorderedBulkOp();
        iexAPI.get<SymbolProps[]>(`/ref-data/symbols?token=${process.env.IEX_TOKEN}`).then((res)=>{
        if(res.data){
            
            res.data.map((doc)=>{
                unorderBulk.insert(doc)
            })
            unorderBulk.execute((err,result)=>{
                // console.log(err)
                // console.log(result)
            })
            
        }    
       
        })
    }


})


