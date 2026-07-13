import {createContext, useState} from "react";

export const StoreContext = createContext();

function StoreProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    return (
        <StoreContext.Provider value={{ user, setUser, isAdmin, setIsAdmin }}>
            {children}
        </StoreContext.Provider>
    );
}
export default StoreProvider;