import { Meteor } from 'meteor/meteor';

import './accounts';
import './symbols';
import './stock';
import './transcations'
import { Accounts } from 'meteor/accounts-base';
import dotenv from 'dotenv';
Accounts.config({
  sendVerificationEmail: true
});
Meteor.startup(() => {
  // If the Links collection is empty, add some data.
  if (process.env.NODE_ENV !== 'production') {
    const res = dotenv.config({path:'C:\\Users\\Tabahani\\Documents\\codingstuff\\.env'});

  }

});
