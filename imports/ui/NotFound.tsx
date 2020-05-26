import React from 'react';
import { Card, Grid, makeStyles, Typography, Icon, SvgIcon } from '@material-ui/core';
import { CenterDiv } from './Transactions';
import WarningIcon from '@material-ui/icons/Warning';

const useStyles = makeStyles({
    cardPadding: {
        paddingLeft: '1rem',
        paddingRight: '1rem'
    }
})

export const NotFound = () => {
    const styles = useStyles();
    return (
        <Card className={styles.cardPadding}>
            <Grid sm={12}>
                <CenterDiv>
                    <Typography
                        variant='h4' color='primary' >Sorry This Page Does Not Exist</Typography>
                </CenterDiv>
            </Grid>
            
                <CenterDiv>
                    <WarningIcon viewBox='0 0 30 20' style={{fontSize:'200px',color:'grey'}}/>
                </CenterDiv>
        
        </Card>
    )
}