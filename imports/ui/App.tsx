import { Container, createMuiTheme, ThemeProvider, CircularProgress } from '@material-ui/core';
import { lightGreen } from '@material-ui/core/colors';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AppHeaderAuthorized, AppHeaderUnAuthorized } from './AppHeader';
import { LoginPage } from './Login';
import { PortfolioPage } from './Portfolio';
import { RegisterPage } from './Register';
import { TransactionPageWrapper, CenterDiv } from './Transactions';
import { Verification } from './Verication';
import { CustomUser } from '/server/accounts';
import { NotFound } from './NotFound';


const AuthorizationnRoute = ()=>{
  const user = Meteor.user() as CustomUser;
  if(!user){
    return <CenterDiv><CircularProgress/></CenterDiv>
  }
  if(!user.verified){
    return(
    <Switch>
    <Route path='/'component={Verification}/>
    <Route component={NotFound}/>
    </Switch>
    )
  }
  return(
    <Switch>
      <Route exact  path='/' component={PortfolioPage}/>
      <Route  path='/transactions' component={TransactionPageWrapper} />
      <Route path='/portfolio' component={PortfolioPage}/>
      <Route component={NotFound}/>
      </Switch>
  )
}
const UnAuthorizationRoute = ()=>{
  return(
    <Switch>
    <Route  path="/register" component={RegisterPage} />
    <Route path='/login' component={LoginPage}/>
    <Route exact  path='/' component={LoginPage}/>
      <Route component={NotFound}/>
    </Switch>
  )
}

export const InnerApp = ({loading,user}:any) => {
  const darkTheme = createMuiTheme({
    palette: {
      primary: lightGreen
    },
  });
  return( 
    <>
     <ThemeProvider theme={darkTheme}>
   
      <BrowserRouter>
      
        {
          !user?<AppHeaderUnAuthorized/>:<AppHeaderAuthorized/>
        }
        <Container>
        {
          !user?<UnAuthorizationRoute/>:<AuthorizationnRoute/>
        }
        </Container>
      </BrowserRouter>
   
      </ThemeProvider>
   
    </>
  )
};
const UserContainer = withTracker(()=>{
  return{
    loading:Meteor.loggingIn(),
    user:Meteor.userId(),
    userObject:Meteor.user()
  }
})(InnerApp)
export const App = ()=>{
  return(
    <UserContainer/>

 
  )
}