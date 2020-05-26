import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, IconButton, makeStyles, TextField, Typography } from "@material-ui/core";
import Icon from '@material-ui/core/Icon';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import RemoveIcon from '@material-ui/icons/Remove';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Meteor } from 'meteor/meteor';
import { withTracker } from "meteor/react-meteor-data";
import React, { useState } from 'react';
import { getCurrentPriceIEX, getTicketBatchQuoteChart, Stock, StockSchema, SymbolProps } from "../api/stocks";
import { LineGraph, PriceThings } from "./PortfolioCard";
import { BackgroundDiv } from "./TransactionCard";
import { CenterDiv, PaginationResults } from "./Transactions";
import { CustomUser } from "/server/accounts";


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


interface DetermineColor {
    isEven: boolean
}

const StockCard = (props: StockIEXCombineProps & DetermineColor) => {
    const IconStockDirection = () => {
        if (props.latestPrice > props.open) {
            return <Icon style={{ color: 'green' }}><ArrowUpwardIcon /></Icon>
        }
        if (props.latestPrice < props.open) {
            return <Icon style={{ color: 'red' }}><ArrowDownwardIcon /></Icon>
        }
        return <Icon style={{ color: 'grey' }}><RemoveIcon /></Icon>
    }

    return (
        <BackgroundDiv

            color={props.isEven ? '#e0e0e0' : 'white'}>
            <Grid container>
                <Grid sm={8}>
                    <Typography
                        variant='h5'>{`${props.ticket} - ${props.shares} Shares `}</Typography>
                </Grid>
                <Grid sm={1}>
                    <IconStockDirection />
                </Grid>
                <Grid sm={2}>
                    <Typography
                        variant='h5'>{`$ ${(props.latestPrice * props.shares).toFixed(2)} `}</Typography>
                </Grid>
            </Grid>




        </BackgroundDiv>
    )
}
interface StockListProps {
    loading: boolean,
    stocks: StockSchema[]
}

interface StockIEXCombineProps {
    latestPrice: any;
    open: any;
    chart: any;
    ticket: string;
    shares: number;
    userId: string;
    lastUpdate: Date;
}
const StockList = (props: StockListProps) => {
    const [apiResults, setResults] = useState<StockIEXCombineProps[]>([]);
    const [loaded, setLoaded] = useState(false)
    const user = Meteor.user() as CustomUser;


    React.useEffect(() => {

        const tickets = props.stocks.map((elm) => elm.ticket)
        if (tickets.length > 0&&!loaded) {

                getTicketBatchQuoteChart(tickets).then((res) => {
                    if (res.data) {
                        const craptoReturn: StockIEXCombineProps[] = [];
                        tickets.map((ticket) => {
                            const stockProps = props.stocks.find(elm => elm.ticket == ticket);
                            if (stockProps) {

                                craptoReturn.push({
                                    ...stockProps,
                                    latestPrice: res.data[ticket].quote.latestPrice,
                                    open: res.data[ticket].quote.open,
                                    chart: res.data[ticket].chart

                                })

                            }
                        });
                        setResults(craptoReturn)
                        setLoaded(true)
                    }
                })
            } 
    }, [props.stocks,loaded,user.capital])
    return (
        <>
            {
                 apiResults.map((elem, indx) => <StockCard {...elem} isEven={indx % 2 == 0} />)
            }
        </>
    )

}

interface PortfolioPaginationProps {
    skip: number,
    limit: number,
}
const PortfolioPagination = withTracker((props: PortfolioPaginationProps) => {
    const handleStockPage = Meteor.subscribe('user-stock-pagination', props.skip, props.limit);
    const loading = !handleStockPage.ready();
    const stockList = Stock.findOne({}, { sort: { lastUpdate: -1 } });
    const user = Meteor.user() as CustomUser;
    const stockLists = user ? user.stockList : [];
    return {
        loading,
        stocks: !!stockList && !!user ? Stock.find({ _id: { $in: stockLists } }, { sort: { lastUpdate: -1 } }).fetch() : []
    }

})(StockList)

export const PortfolioPageWrapper = () => {
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const user = Meteor.user() as CustomUser;
    React.useEffect(() => {
        if (user) {
            setCount(user.stockList.length)
        }
    }, [user])

    const handleButtonClick = () => {
        setPage(page + 1)
    }
    const handleButtonBackClick = () => {
        setPage(page - 1)
    }


    return (
        <>
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
            <PortfolioPagination skip={page * 5} limit={5} />
            <Grid sm={12}>
                <CenterDiv>
                    <IconButton color='primary' disabled={(page + 1) * 5 > count} onClick={handleButtonClick}><ArrowDownwardIcon /></IconButton >
                </CenterDiv>
            </Grid>
        </>
    )

}

const BuyTicker = () => {

    const [value, setValue] = React.useState<SymbolProps | null>(null);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState<SymbolProps[]>([]);
    const [currentPrice, setPrice] = React.useState(0)
    const [shares, setShares] = React.useState<number>(0);
    const [open, setOpen] = React.useState(false);
    const [buyOrSell, setBuySell] = React.useState(false);
    const [errorStock, seterrorStock] = React.useState(false);
    const [errorStockMessage, setErrorStockMessage] = React.useState('');
    const [errorQty, seterrorQty] = React.useState(false);
    const [errorQtyMessage, setQtyMessage] = React.useState('');
    const [dialogMessage, setDialogMessage] = React.useState('');
    const [globalError, setGlobalError] = React.useState<boolean>(false);
    const [globalErrorText, setGlobalErrorText] = React.useState<string>('')

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const handleCloseGlobal = () => {
        setGlobalError(false)
    }

    const isWholeNumber = (num: number) => {
        return Number.isInteger(num);
    }

    const handleNumberSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const qtyVale = Number(event.target.value);
        if (!isNaN(qtyVale)) {
            if (isWholeNumber(qtyVale) && qtyVale > 0) {
                setShares(parseInt(event.target.value))
                seterrorQty(false);
                setQtyMessage('')
            }
            else {
                seterrorQty(true);
                setQtyMessage('Not a Whole Number')
            }
        } else {
            seterrorQty(true);
            setQtyMessage('Not a valid Quantity')
        }


    }
    const handlePurchase = () => {
        if (value) {
            if (shares > 0 && !errorQty) {
                setDialogMessage(`Confirm Buy - ${shares} Shares @ ${currentPrice} ${value.symbol}`)
                handleClickOpen();
                setBuySell(true);
            } else {
                setQtyMessage('Not a valid share amount')
            }

        } else {
            seterrorStock(false);
            setErrorStockMessage('Not a valid Stock')
        }

    }
    const handleSell = () => {
        if (value) {
            if (shares > 0 && !errorQty) {
                setDialogMessage(`Confirm Sell - ${shares} Shares  @ ${currentPrice} ${value.symbol}`)
                handleClickOpen();
                setBuySell(false);
            } else {
                setQtyMessage('Not a valid share amount')
            }
            // Meteor.call('sellStock', value.symbol, shares, currentPrice)
        }
        else {
            seterrorStock(false);
            setErrorStockMessage('Not a valid Stock')
        }


    }
    const handleConfirm = () => {
        if (!errorStock && !errorQty) {
            handleClose()
            if (buyOrSell) {//buying  
                if (value) {
                    getCurrentPriceIEX(value.symbol).then((res) => {
                        if (res.data) {
                            Meteor.call('buyStock', value.symbol, shares, res.data, (err: any, resM: any) => {
                                if (err) {
                                    setGlobalError(true);
                                    setGlobalErrorText('Sorry cannot confirm you order at this time')
                                    handleClose()
                                    return;
                                }
                                if (resM) {
                                    const { cantAfford, stockLessThanZero } = resM;
                                    if (!!cantAfford) {
                                        setGlobalError(true);
                                        setGlobalErrorText('Sorry you do not have enough funds for this purchase')
                                        handleClose()
                                        return;
                                    }
                                    if (!!stockLessThanZero) {
                                        setGlobalError(true);
                                        setGlobalErrorText('Sorry you can not buy zero stocks')
                                        handleClose()
                                        return;
                                    }
                                }
                                setPrice(res.data);
                                handleClose()
                            })

                        } else {
                            setGlobalError(true);
                            setGlobalErrorText('Sorry cannot confirm you order at this time')
                            handleClose()
                            return;
                        }

                    })
                }

            } else {
                if (value) {
                    getCurrentPriceIEX(value.symbol).then((res) => {
                        if (res.data) {
                            Meteor.call('sellStock', value.symbol, shares, res.data, (err: any, resM: any) => {
                                if (err) {
                                    setGlobalError(true);
                                    setGlobalErrorText('Sorry cannot confirm you order at this time')
                                    handleClose();
                                    return;
                                }
                                if (resM) {
                                    const { dontOwnStok } = resM;
                                    if (!!dontOwnStok) {
                                        setGlobalError(true);
                                        setGlobalErrorText('Sorry you do not own enough shares for this order')
                                        handleClose()
                                        return;
                                    }
                                }
                                setPrice(res.data);
                                handleClose()
                            })
                        } else {
                            setGlobalError(true);
                            setGlobalErrorText('Sorry cannot confirm you order at this time')
                            handleClose()
                            return;
                        }

                    })
                }
            }
        }
    }

    const getCurrentPrice = (symbol: SymbolProps | null) => {
        if (symbol) {
            getCurrentPriceIEX(symbol.symbol).then((res) => setPrice(res.data))
        }
    }
    React.useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions(value ? [value] : []);
            return undefined;
        }

        if (active) {
            Meteor.call('findSymbol', inputValue, (err: any, res: any) => {
                let newOptions = [] as SymbolProps[];
                if (value) {
                    newOptions = [value];
                }
                if (res) {
                    newOptions = [...newOptions, ...res];
                }
                setOptions(newOptions);
            })
        }


        return () => {
            active = false;
        };
    }, [value, inputValue]);
    const classes = useStyles();

    return (
        <>
            <Grid container>
                <Grid sm={12}>
                    <FormControl className={classes.textStyles}>
                        <Autocomplete
                            id="asynchronous-demo"

                            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                            filterOptions={(x) => x}
                            options={options}
                            autoComplete
                            includeInputInList
                            filterSelectedOptions
                            value={value}
                            onChange={(event: any, newValue: SymbolProps | null) => {
                                setOptions(newValue ? [newValue, ...options] : options);
                                setValue(newValue);
                                getCurrentPrice(newValue)
                            }}
                            onInputChange={(event, newInputValue) => {
                                setInputValue(newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Stock Name"
                                    variant="filled"
                                    error={errorStock}
                                    helperText={errorStockMessage}
                                    InputProps={{
                                        ...params.InputProps,
                                    }}
                                />
                            )}
                        />
                    </FormControl>
                </Grid>
                <Grid sm={12}>
                    <FormControl className={classes.textStyles}>
                        <TextField
                            label='Quantity'
                            type='number'
                            variant="filled"
                            error={errorQty}
                            helperText={errorQtyMessage}
                            onChange={handleNumberSelect}
                        />
                    </FormControl>
                </Grid>
                <Grid sm={12}>

                    {isWholeNumber(shares) && shares > 0 ?
                        <FormControl className={classes.textStyles}>
                            <CenterDiv>
                                <Typography variant='h6'>{`${shares} @ $${currentPrice}`}</Typography>

                            </CenterDiv>
                        </FormControl>
                        : null
                    }
                </Grid>
                <Grid sm={12}>
                    <FormControl className={classes.textStyles}>
                        <Button
                            fullWidth
                            variant="contained" color="primary" disableElevation
                            onClick={handlePurchase}
                        >

                            Buy
                    </Button>
                    </FormControl>
                </Grid>
                <Grid sm={12}>
                    <FormControl className={classes.textStyles}>
                        <Button
                            fullWidth
                            variant="contained" color="secondary" disableElevation
                            onClick={handleSell}
                        >

                            Sell
                    </Button>
                    </FormControl>
                </Grid>
            </Grid>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Order?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {dialogMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Disagree
          </Button>
                    <Button onClick={handleConfirm} color="primary" autoFocus>
                        Agree
          </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={globalError}
                onClose={handleCloseGlobal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Something Went Wrong</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {globalErrorText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGlobal} color="primary" autoFocus>
                        Okay
          </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export const PortfolioPage = () => {
    const user = Meteor.user() as CustomUser;
    const styles = useStyles();
    return (
        <Card className={styles.cardPadding}>
            <Grid container >
                <Grid sm={12}>
                    <PriceThings />
                </Grid>
                <Grid sm={8}>
                    <PortfolioPageWrapper />
                </Grid>
                <Grid container sm={4}>
                    <Grid sm={12}>
                        <CenterDiv>
                            <Typography variant='h5'>
                                Cash - $
                        {
                                    user ? user.capital.toFixed(2) : null
                                }
                            </Typography>
                        </CenterDiv>
                    </Grid>
                    <Grid sm={12}>
                        <BuyTicker />
                    </Grid>

                </Grid>
                <Grid sm={12}>
                    <LineGraph />
                </Grid>
            </Grid>
        </Card>
    )
}
