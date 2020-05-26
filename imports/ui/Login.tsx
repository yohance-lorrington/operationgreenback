import React, { useState } from 'react';
import { FormControl, Grid, TextField, Card, makeStyles, Button, Typography, Dialog, DialogContent, DialogTitle, DialogContentText, DialogActions } from '@material-ui/core';

import axios from 'axios';
import { Meteor } from 'meteor/meteor';
import { useHistory } from 'react-router-dom'
import { Accounts } from 'meteor/accounts-base';
import { useAuth } from './UserContext';
const useStyles = makeStyles({
  textStyles: {
    width: '95%',
    marginTop: '1rem',
    marginBottom:'1rem',
    paddingLeft: '2rem',
    paddingRight: '2rem'
  }, buttonStyle: {
    width: '95%',
    marginTop: '1rem',
    marginBottom: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  }
})
export const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [globalError, setGlobalError] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [password1Error, setPass1Error] = useState<boolean>(false);
  const [password1ErrorText, setPass1ErrorText] = useState<string>('');
  const [emailErrorText, setEmailErrorText] = useState<string>('');

  const classes = useStyles();
  const history = useHistory();
  const handleEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailError(false)
    setEmailErrorText('')
    setEmail(event.target.value);
  };
  const handlPassword= (event: React.ChangeEvent<HTMLInputElement>) => {
    setPass1Error(false);
    setPass1ErrorText('')
    setPassword(event.target.value);
  };
  const handleClose = () => {
    setGlobalError(true)
  }
  const validateEmail = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }
  const handleLogin = ()=>{
    if (!validateEmail(email)) {
      setEmailError(true)
      setEmailErrorText('Not a Valid Email Addresss')
      return;
    }
    if(password.length == 0){
      setPass1Error(true);
      setPass1ErrorText('Password can not be empty');
      return;
    }
    Meteor.call('checkIfUserExistsAlready', email, (err: any, res: any) => {
      console.log(err);
      if (err) {
        setGlobalError(true)
      } else {
        const { userExists } = res;
        if (!userExists) {
          setEmailError(true)
          setEmailErrorText(`There isn't an account with this email address`);
          return;
        } else {
          Meteor.loginWithPassword(email,password,(error:any)=>{
            if(error){
              if(error.error === 403){
                setPass1Error(true);
                setPass1ErrorText('Incorrect Password');
                return;
              }
              setGlobalError(true);
              return;
            }else{
              history.push('/')
            }
          })
        }
      }

    })
 

  }

  return (
    <Card>
      <Grid sm={12} className={classes.textStyles}>
      <Typography variant='h3' color='primary'>
          Login
        </Typography>

      </Grid>
      <Grid sm={12}>
        <FormControl className={classes.textStyles}>
          <TextField
            id="standard-password-input"
            label="Email"
            type="email"
            variant="filled"
            error={emailError}
            helperText={emailErrorText}
            onChange={handleEmail}
          />
        </FormControl>
      </Grid>

      <Grid sm={12}>
        <FormControl className={classes.textStyles}>
          <TextField

            id="standard-password-input"
            label="Password"
            type="password"
            variant="filled"
            error={password1Error}
            helperText={password1ErrorText}
            onChange={handlPassword}
          />

        </FormControl>

      </Grid>
      <Grid container spacing={2}
        direction="row"
        justify='space-around'
        alignItems="center" >

        <Grid sm={4}>
          <FormControl style={{ paddingLeft: '0px' }} className={classes.buttonStyle}>
            <Button onClick={()=>history.push('/register')}
              fullWidth
              disableElevation
          
            >Register</Button>
          </FormControl>
        </Grid>
        <Grid sm={4}>
          <FormControl style={{ paddingLeft: '0px' }} className={classes.buttonStyle}>
            <Button onClick={handleLogin}
              fullWidth
              disableElevation
              color='primary'
              variant='contained'
            > Login</Button>
          </FormControl>
        </Grid>
      </Grid>
      <Dialog
        open={globalError}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Something Went Wrong</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Sorry We are not able to verify your login at the moment
          </DialogContentText>
        </DialogContent>
        <DialogActions>>
          <Button onClick={handleClose} color="primary" autoFocus>
            Okay
          </Button>
        </DialogActions>
      </Dialog>


    </Card>
  )
}