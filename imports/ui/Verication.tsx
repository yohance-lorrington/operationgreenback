import React from 'react';
import { Card, makeStyles, Typography, Grid, FormControl, Button } from '@material-ui/core';
import { Meteor } from 'meteor/meteor';
import { CenterDiv } from './Transactions';

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
export const Verification = () => {
    const classes = useStyles();

    const sendVerificationEmail = () => {
        Meteor.call('sendEmailVerification', (err: any, res: any) => {
            if (err) {
                //handleError
                console.log()
            }
        })
    }
    return (
        <Card>
            <Grid sm={12} className={classes.textStyles}>
                <CenterDiv>
                <Typography variant='h3' color='primary'>
                    To use Operation GreenBacks you need to verify your email address. Please check your email for a link.
        </Typography>
        </CenterDiv>
            </Grid>
            <Grid sm={12} className={classes.textStyles}>
                <CenterDiv>
                <Typography variant='h5' color='primary'>
                    Didn't receive the email?
        </Typography>
        </CenterDiv>
            </Grid>
            <Grid container spacing={2}
                direction="row"
                justify='space-around'
                alignItems="center" >


                <Grid sm={4}>
                    <FormControl style={{ paddingLeft: '0px' }} className={classes.buttonStyle}>
                        <Button onClick={sendVerificationEmail}
                            fullWidth
                            disableElevation
                            color='primary'
                            variant='contained'
                        >Send New link</Button>
                    </FormControl>
                </Grid>
            </Grid>
        </Card>
    )
}