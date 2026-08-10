import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";

import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    // ========================================
    // Login
    // ========================================
    const login = (userData, token) => {

        localStorage.setItem("token", token);
        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    };

    // ========================================
    // Logout
    // ========================================
    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
    };

    // ========================================
    // ตรวจสอบ User ทุก 5 วินาที
    // ========================================
    useEffect(() => {

        if (!user) return;

        const checkUserStatus = async () => {

            try {

                const response = await axios.get("/auth/me");

                // อัปเดตข้อมูล User ล่าสุด
                if (response.data) {

                    localStorage.setItem(
                        "user",
                        JSON.stringify(response.data)
                    );

                    setUser(response.data);
                }

            } catch (error) {

                if (
                    error.response?.status === 401 &&
                    error.response?.data?.message ===
                    "ACCOUNT_BLOCKED"
                ) {

                    logout();

                    alert(
                        "ບັນຊີຂອງທ່ານຖືກບລັອກ\nກະລຸນາຕິດຕໍ່ Owner"
                    );

                    window.location.href = "/login";
                }
            }
        };

        // ตรวจทันที
        checkUserStatus();

        // ตรวจทุก 5 วินาที
        const interval = setInterval(
            checkUserStatus,
            5000
        );

        return () => {
            clearInterval(interval);
        };

    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);