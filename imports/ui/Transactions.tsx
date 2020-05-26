import { Card, Grid, IconButton, makeStyles, Typography } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Transcation } from '../api/transcations';
import { TransactionList, TranscationView } from './TransactionCard';

interface TransactionPaginationProps {
    skip: number,
    limit: number
}
const useStyles = makeStyles({
    textStyles: {
        width: '95%',
        marginTop: '1rem',
        marginBottom: '1rem',
        paddingLeft: '2rem',
        paddingRight: '2rem'
    },
    cardPadding: {
        paddingLeft: '1rem',
        paddingRight: '1rem'
    }
})
export const CenterDiv = styled.div`
display: flex;
justify-content: center;
align-items:center;
padding-left:1rem;
height: 100%;`
export const TransactionsPagination = withTracker((props: TransactionPaginationProps) => {
    const handleTransactions = Meteor.subscribe('recent-transcations', props.skip, props.limit);
    const loading = !handleTransactions.ready();
    const transactionsList = Transcation.findOne({});
    return {
        loading,
        transactions: !!transactionsList ? Transcation.find({}).fetch() : []
    };
})(TransactionList);
interface PaginationResultsProps {
    count: number,
    page: number
}
export const PaginationResults = (props: PaginationResultsProps) => {
    return (
        <Typography variant='body1'>
            Showing <b>{props.page > props.count ? props.count : props.page}</b> out of <b>{props.count}</b>
        </Typography>
    )
}

export const TransactionPageWrapper = () => {
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);

    const [loaded, setLoaded] = useState(false);

    React.useEffect(() => {
        if (!loaded) {
            Meteor.call('getTranscationCount', (err: any, res: any) => {
                if (!err) {
                    setLoaded(true);
                    setCount(res)
                }

            })
        }
    }, [loaded])

    const handleButtonClick = () => {
        setPage(page + 1)
    }
    const handleButtonBackClick = () => {
        setPage(page - 1)
    }
    const classes = useStyles();

    return (
        <Card className={classes.cardPadding}>
            <Grid sm={12} style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                <CenterDiv>
                    <Typography
                        variant='h4' color='primary' >Your Transactions</Typography>
                </CenterDiv>
            </Grid>
            <Grid sm={12}>
                <CenterDiv>
                    <PaginationResults page={(page + 1) * 5} count={count} />
                </CenterDiv>
            </Grid>
            <Grid sm={12}>
                <CenterDiv>
                    <IconButton color='primary' disabled={page === 0} onClick={handleButtonBackClick}><ArrowUpwardIcon /></IconButton >
                </CenterDiv>
            </Grid>
            <TransactionsPagination skip={page * 5} limit={5} />
            <Grid sm={12}>
                <CenterDiv>
                    <IconButton color='primary' disabled={(page + 1) * 5 > count} onClick={handleButtonClick}><ArrowDownwardIcon /></IconButton >
                </CenterDiv>
            </Grid>
            <Grid sm={12}>
                <TranscationView />
            </Grid>
        </Card>
    )

}