import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true);

    /* ── Fetch the logged-in user from the server (cookie-based) ── */
    const fetchUser = async () => {
        try {
            const res = await axios.get(
                "https://skillssync-a4r9.onrender.com/api/auth/profile",
                { withCredentials: true }
            );
            setUser(res.data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    /* ── Convenience helper: call after a successful login API response ── */
    const login = (userData) => {
        setUser(userData);
    };

    /* ── Convenience helper: call on logout ── */
    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login,
                logout,
                loading,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext);
