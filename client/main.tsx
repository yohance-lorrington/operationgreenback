import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { App } from '/imports/ui/App'
import 'typeface-roboto';
import dotenv from 'dotenv';
import { Accounts } from 'meteor/accounts-base';
Accounts.onEmailVerificationLink((token:any,done:any)=>{
  Accounts.verifyEmail(token,(err)=>{
    if(!err){
      Meteor.call('verifyUser',(res:any)=>{
        done();
      })
     
    }
  })
})
Meteor.startup(() => {
  render(<App />, document.getElementById('react-target'));
});
