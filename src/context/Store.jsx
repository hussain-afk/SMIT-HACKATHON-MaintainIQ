import { createContext, useState, useEffect } from "react";
import { auth, onAuthStateChanged } from "../config/firebase";

export const StoreContext = createContext();

function StoreProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [photoURL, setPhotoURL] = useState(null);

    // Get initial state from localStorage safely
    const [isAdmin, setIsAdminState] = useState(() => {
        return localStorage.getItem('maintainiq_isAdmin') === 'true';
    });

    // Helper to update both React state & LocalStorage
    const setIsAdmin = (value) => {
        localStorage.setItem('maintainiq_isAdmin', value ? 'true' : 'false');
        setIsAdminState(value);
    };

    // Listen for Firebase auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setAuthChecked(true);
            if (firebaseUser) {
                setPhotoURL(firebaseUser.photoURL);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <StoreContext.Provider value={{ user, setUser, isAdmin, setIsAdmin, authChecked, photoURL, setPhotoURL }}>
            {children}
        </StoreContext.Provider>
    );
}

export default StoreProvider;