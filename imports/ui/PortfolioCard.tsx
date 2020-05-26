import { Typography, Grid } from "@material-ui/core";
import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { getTicketBatchQuote, StockSchema, getTicketBatchQuoteChart } from "../api/stocks";
import { CustomUser } from "/server/accounts";
import { LineChart, PieChart } from 'react-chartkick'
import 'chart.js'
import { CenterDiv } from "./Transactions";
export const PriceThings = () => {
    const user = Meteor.user() as CustomUser;
    const [currentValue, setCurrentValue] = useState(0);
    const [loaded, setLoaded] = useState(false)
    React.useEffect(() => {

        if (user) {
            Meteor.call('getUserStockList', (err: any, resMeteor: StockSchema[]) => {
                if (!err) {
                    const existOnUser = resMeteor.filter((stock) => user.stockList.includes(stock._id));
                    const tickets = existOnUser.map((stock) => stock.ticket);

                    if (tickets.length > 0 && !loaded) {
                        getTicketBatchQuote(tickets).then((res) => {
                            if (res.data) {
                                const priceandShares: { shares: number, price: number }[] = [];
                                tickets.map((ticket) => {
                                    const stockProps = resMeteor.find(elm => elm.ticket == ticket);
                                    if (stockProps) {
                                        priceandShares.push({
                                            price: res.data[ticket].quote.latestPrice,
                                            shares: stockProps.shares

                                        })
                                    }
                                });
                                const sum = priceandShares.reduce((count, elm2) => {
                                    return count + elm2.price * elm2.shares
                                }, 0)
                                setCurrentValue(sum);
                            }
                            setLoaded(true)
                        })
                    }
                }

            })
        }
    }, [user.stockList, currentValue])
    return (
        <>
            <Typography variant='h3'>
                {`Portfolio ($ ${(currentValue + user.capital).toFixed(2)})`}
            </Typography>
            <PieChart data={[["Capital", user.capital.toFixed(2)], ["Stocks", (currentValue).toFixed(2)]]} colors={["#8BC34A", "#666"]} />
        </>
    )
}
export const allTicketsAreThere = (Object: any, tickes: string[]) => {
    for (let idx: number = 0; idx < tickes.length; ++idx) {
        if (!Object[tickes[idx]]) {
            return false;
        }
    }
    return true;

}
export const LineGraph = () => {
    const user = Meteor.user() as CustomUser;
    const [dataMapForLine, setMap] = useState<Map<string, number>>(new Map());
    const [loaded, setLoaded] = useState(false)
    React.useEffect(() => {

        if (user) {
            Meteor.call('getUserStockList', (err: any, resMeteor: StockSchema[]) => {
                if (!err) {
                    const existOnUser = resMeteor.filter((stock) => user.stockList.includes(stock._id));
                    const tickets = existOnUser.map((stock) => stock.ticket);
                    const dataMap = new Map<string, number>()

                    if (tickets.length > 0 && !loaded) {
                        getTicketBatchQuoteChart(tickets).then((res) => {

                            if (res.data) {

                                tickets.map((ticket) => {
                                    const chartData = res.data[ticket].chart as any[];
                                    const stockProps = resMeteor.find(elm => elm.ticket == ticket);
                                    if (stockProps) {
                                        chartData.map((dataForDay) => {
                                            if (dataMap.get(dataForDay.date)) {
                                                const value = dataMap.get(dataForDay.date)! + dataForDay.open * stockProps.shares;
                                                dataMap.set(dataForDay.date, value)
                                            } else {
                                                dataMap.set(dataForDay.date, dataForDay.open * stockProps.shares)
                                            }
                                        })

                                    }
                                });
                                setMap(dataMap)
                            }
                            setLoaded(true)
                        })
                    }
                }

            })
        }
    }, [user.stockList])
    return (

        <Grid container>
            <Grid sm={12} style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                <CenterDiv>
                    <Typography
                        variant='h4' >Your Stock's Performance</Typography>
                </CenterDiv>
            </Grid>
            <Grid sm={12}>{
                dataMapForLine.size>0?  <LineChart data={Array.from(dataMapForLine.entries())} colors={["#8BC34A", "#666"]} />
                :        <CenterDiv>
                <Typography
                    variant='h5' >Your Don't Have Stocks In Your Portfolio</Typography>
            </CenterDiv>
            }
              
            </Grid>
        </Grid>
    )
}