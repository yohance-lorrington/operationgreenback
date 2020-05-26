import React, { useState } from 'react';
import { FormControl, Grid, TextField, Card, makeStyles, Button, Dialog, DialogContentText, DialogContent, DialogTitle, DialogActions, Typography } from '@material-ui/core';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { useHistory } from 'react-router-dom'


const useStyles = makeStyles({
  textStyles: {
    width: '95%',
    marginTop: '1rem',
    marginBottom: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  }, buttonStyle: {
    width: '95%',
    marginTop: '1rem',
    marginBottom: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  }
})
export const RegisterPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [username, setUserName] = useState<string>('');

  const [emailError, setEmailError] = useState<boolean>(false);
  const [password1Error, setPass1Error] = useState<boolean>(false);
  const [password2Error, setPass2Error] = useState<boolean>(false);
  const [usernameError, setUserNameError] = useState<boolean>(false);

  const [emailErrorText, setEmailErrorText] = useState<string>('');
  const [password1ErrorText, setPass1ErrorText] = useState<string>('');
  const [password2ErrorText, setPass2ErrorText] = useState<string>('');
  const [usernameErrorText, setUserNameErrorText] = useState<string>('');

  const [globalError, setGlobalError] = useState<boolean>(false);
  const classes = useStyles();

  const handleEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const handlPasswordField1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const handlPasswordField2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  const handleUserName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const validateEmail = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  }

  const handleClose = () => {
    setGlobalError(true)
  }
  const history = useHistory();

  const handleCreatUser = () => {
    if (!validateEmail(email)) {
      setEmailError(true)
      setEmailErrorText('Not a Valid Email Addresss')
      return;
    }
    if (password.length === 0 || confirmPassword.length === 0) {
      setPass1Error(true);
      setPass1ErrorText('Password can not be empty');

      setPass2Error(true);
      setPass2ErrorText('Password can not be empty');
      return;
    }
    if (password.localeCompare(confirmPassword) !== 0) {
      setPass1Error(true);
      setPass1ErrorText('Password Must Match');

      setPass2Error(true);
      setPass2ErrorText('Password Must Match');
      return;
    }
    if (username.length === 0) {
      setUserNameError(true);
      setUserNameErrorText('Username cannot be empty');
      return;
    }
    Meteor.call('checkIfUserExistsAlready', email, (err: any, res: any) => {
      console.log(err);
      if (err) {
        setGlobalError(true)
      } else {
        const { userExists } = res;
        if (userExists) {
          setEmailError(true)
          setEmailErrorText('Someone is already registered with this email');
          return;
        } else {
          Accounts.createUser({
            email: email, username: username, password: password
          }, (error) => {
            if (error) {
              setGlobalError(true)
            } else {
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
          Register
        </Typography>
      </Grid>
      <Grid sm={12}>
        <FormControl className={classes.textStyles}>
          <TextField
            id="standard-email-input"
            label="Email"
            type="email"
            error={emailError}
            helperText={emailErrorText}
            variant="filled"
            onChange={handleEmail}

          />
        </FormControl>
      </Grid>

      <Grid sm={12}>
        <FormControl className={classes.textStyles}>
          <TextField
            id="standard-email-input"
            label="Username"
            type="text"
            error={usernameError}
            helperText={usernameErrorText}
            variant="filled"
            onChange={handleUserName}

          />
        </FormControl>
      </Grid>
      <Grid container>
        <Grid sm={6}>
          <FormControl style={{ paddingRight: '0px' }} className={classes.textStyles}>
            <TextField

              id="standard-password-input"
              label="Password"
              type="password"
              variant="filled"
              error={password1Error}
              helperText={password1ErrorText}
              onChange={handlPasswordField1}

            />

          </FormControl>

        </Grid>
        <Grid sm={6}>
          <FormControl style={{ paddingLeft: '0px' }} className={classes.textStyles}>
            <TextField

              id="standard-password-input"
              label="Confirm Password"
              type="password"
              variant="filled"
              error={password2Error}
              helperText={password2ErrorText}
              onChange={handlPasswordField2}
            />

          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}
        direction="row"
        justify='space-around'
        alignItems="center" >
        <Grid sm={4}>
          <FormControl style={{ paddingLeft: '0px' }} className={classes.buttonStyle}>
            <Button onClick={() => history.push('/login')}
              fullWidth
              disableElevation

            >Already Have an Account? Login</Button>
          </FormControl>
        </Grid>
        <Grid sm={4}>
          <FormControl style={{ paddingLeft: '0px' }} className={classes.buttonStyle}>
            <Button onClick={handleCreatUser}
              fullWidth
              disableElevation
              color='primary'
              variant='contained'
            >Register</Button>
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