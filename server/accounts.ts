import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
export interface CustomUser {
    _id: string;
    stockList:string[],
    username?: string | undefined;
    emails?: Meteor.UserEmail[] | undefined;
    createdAt?: Date | undefined;
    profile?: any;
    services?: any;
    verified: boolean;
    capital: number;

}
Accounts.emailTemplates.siteName = 'Operation GreenBacks';
Accounts.emailTemplates.from = 'Operation GreenBacks Admin <tabahanih@gmail.com>';
Accounts.emailTemplates.verifyEmail = {
    subject() {
       return "Activate your account now!";
    },
    text(user, url) {
       return `Hey ${user.username}! Verify your e-mail by following this link: ${url}`;
    }
 };

Accounts.onCreateUser((options,user)=>{
    const newUser = {...{verified:false,capital:5000,stockList:[]},...user}
    return newUser;
})

Meteor.publish(null,function(){
    return Meteor.users.find({_id:this.userId},{fields:{verified:1,stockList:1,username:1,capital:1,emails:1,_id:1}})
})

Meteor.methods({
    checkIfUserExistsAlready(email:string){
        const user = Accounts.findUserByEmail(email);

        if(user){
            return {
                userExists:true
            }
        }
        return {
            userExists:false
        }
    },
    verifyUser(){
        if(this.userId){
            const user = Meteor.users.findOne({_id:this.userId});
            if(user){
                const emailArry = user.emails;
                if(emailArry){
                    const verifiedOrNot = emailArry.map((email)=>{
                        return email.verified
                    });

                    const containsVerified = verifiedOrNot.filter((isVeified)=>isVeified);
                    containsVerified.length>0? Meteor.users.update({_id:this.userId},{$set:{verified:true}}):null;
                }
            }
        }
    },
    sendEmailVerification(){
        if(this.userId){
            Accounts.sendVerificationEmail(this.userId);
        }
    }
})