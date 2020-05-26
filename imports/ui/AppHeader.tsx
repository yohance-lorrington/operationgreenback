import { AppBar, Button, Fade, Icon, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined';
import { Meteor } from 'meteor/meteor';
import React from 'react';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            marginBottom: '1rem'
        },
        icon: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
        },
    }),
);
export const AppHeaderAuthorized = () => {
    const classes = useStyles();
    const user = Meteor.user();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const history = useHistory();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        Meteor.logout();
        history.push('/')

    }
    const handlePortfolio = () => {
        handleClose();
        history.push('/portfolio')
    }
    const handleTranscations = () => {
        handleClose();
        history.push('/transactions')
    }
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Icon style={{ color: 'white' }} className={classes.icon}>
                        <MonetizationOnOutlinedIcon />
                    </Icon>
                    <Button onClick={()=>history.push('/')} style={{textTransform:'none'}}>
                    <Typography style={{ color: 'white' }} className={classes.icon} variant="h4" >
                        Operation GreenBacks
                    </Typography>
                    </Button>
                    <Icon style={{ color: 'white' }} className={classes.title}>
                        <MonetizationOnOutlinedIcon />
                    </Icon>
                    {
                        user?.username ?
                            <Button color="inherit" onClick={handleClick}>{user.username}</Button> :
                            <IconButton style={{ color: 'white' }} onClick={handleClick}>
                                <AccountCircleOutlinedIcon />
                            </IconButton>

                    }
                    <Menu
                        id="fade-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={open}
                        onClose={handleClose}
                        TransitionComponent={Fade}
                    >
                        <MenuItem onClick={handleTranscations}>Transactions</MenuItem>
                        <MenuItem onClick={handlePortfolio}>Portfolio</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>

                </Toolbar>
            </AppBar>
        </div>
    )
}

export const AppHeaderUnAuthorized = () => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const history = useHistory();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogin = () => {
        handleClose();
        history.push('/login')
    }
    const handleRegister = () => {
        handleClose();
        console.log(history)
        history.push('/register')
    }
    return (
        <div className={classes.root}>
            <AppBar position="static">
                <Toolbar>
                    <Icon style={{ color: 'white' }} className={classes.icon}>
                        <MonetizationOnOutlinedIcon />
                    </Icon>
                    <Typography style={{ color: 'white' }} className={classes.icon} variant="h4" >
                        Operation GreenBacks
                    </Typography>
                    <Icon style={{ color: 'white' }} className={classes.title}>
                        <MonetizationOnOutlinedIcon />
                    </Icon>

                    <IconButton style={{ color: 'white' }} onClick={handleClick}>
                        <AccountCircleOutlinedIcon />
                    </IconButton>
                    <Menu
                        id="fade-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={open}
                        onClose={handleClose}
                        TransitionComponent={Fade}
                    >
                        <MenuItem onClick={handleLogin}>Login</MenuItem>
                        <MenuItem onClick={handleRegister}>Register</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        </div>
    )
}