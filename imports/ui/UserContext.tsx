import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { CenterDiv } from './Transactions';
import { CircularProgress } from '@material-ui/core';

export const AuthContext = React.createContext<{ user: string | null, login: Function | null, logout: Function | null }>({
    user: null, login: null, logout: null
});

export const AuthProvider = (props: any) => {
    const [userId, setId] = useState<string | null>(null)
    React.useEffect(() => {
        if (Meteor.loggingIn()) {
            setId(Meteor.userId())
        }
    }, [userId])
    if (Meteor.loggingIn()) {
        return <CenterDiv><CircularProgress /></CenterDiv>
    }

    return (

        <AuthContext.Provider value={{ user: userId, login: Meteor.loginWithPassword, logout: Meteor.logout }} {...props} />
    )


}

export const useAuth = () => React.useContext(AuthContext)
