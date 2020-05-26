import { Grid, Typography } from '@material-ui/core';
import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { ColumnChart } from 'react-chartkick';
import styled from 'styled-components';
import { TranscationSchema } from '../api/transcations';
import { CenterDiv } from './Transactions';
import { CustomUser } from '/server/accounts';
export const BackgroundDiv = styled.div`
padding: .5rem;
margin-bottom:.5rem;
margin-top:.5rem;
background-color: ${props => props.color}
`
interface DetermineColor {
    isEven: boolean
}
export const TransactionCard = (props: TranscationSchema & DetermineColor) => {



    return (
        <>
            <BackgroundDiv

                color={props.isEven ? '#e0e0e0' : 'white'}>
                <Typography
                    variant='h5'>{`${props.action.toUpperCase()} (${props.ticket}) - ${props.shares} Shares @ ${props.priceAtPurchase.toFixed(2)}`}</Typography>
            </BackgroundDiv>

        </>
    )
}
interface TransactionListProps {
    loading: boolean,
    transactions: TranscationSchema[]
}
export const TransactionList = (props: TransactionListProps) => {
    return (
        <>
            {
                props.transactions.length > 0 ? props.transactions.map((elm, indx) => <TransactionCard {...elm} isEven={indx % 2 === 0} />) : <Grid sm={12} style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                    <CenterDiv>
                        <Typography
                            variant='body1' >There Are No Recent Transactions</Typography>
                    </CenterDiv>
                </Grid>
            }
        </>
    )
}
export const TranscationView = () => {
    const user = Meteor.user() as CustomUser;
    const [dataMapForLine, setMap] = useState<Map<string, number>>(new Map())
    React.useEffect(() => {
        if (user) {
            Meteor.call('getThisWeekTranscations', (err: any, res: TranscationSchema[]) => {
                if (res) {
                    const dataMap = new Map<string, number>()

                    res.map((elm) => {
                        const dateString = elm.dateOfPurchase.toLocaleDateString();
                        if (dataMap.get(dateString)) {
                            const value = dataMap.get(dateString)! + 1;
                            dataMap.set(dateString, value)
                        } else {
                            dataMap.set(dateString, 1);
                        }
                    })
                    setMap(dataMap)
                }
            })
        }
    }, [])
    return (
        <Grid container>
            <Grid sm={12} style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                <CenterDiv>
                    <Typography
                        variant='h4' >This Week's Transactions</Typography>
                </CenterDiv>
            </Grid>
            <Grid sm={12}>{
                dataMapForLine.size > 0 ?
                    <ColumnChart label="Number of Transactions" ytitle='Transactions' data={Array.from(dataMapForLine.entries())} colors={["#8BC34A", "#666"]} />
                    :
                    <CenterDiv>
                        <Typography
                            variant='body1' >You Don't Have Any Recent Transactions</Typography>
                    </CenterDiv>
            }
            </Grid>
        </Grid>
    )
}