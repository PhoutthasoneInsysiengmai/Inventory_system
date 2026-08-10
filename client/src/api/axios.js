import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:5000/api"
});

// ========================================
// แนบ Token ทุก Request
// ========================================
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ========================================
// ตรวจสอบ Response
// ========================================
instance.interceptors.response.use(
    (response) => {
        return response;
    },

    (error) => {
        if (error.response?.status === 401) {

            const message = error.response?.data?.message;

            // User ถูก Block
            if (message === "ACCOUNT_BLOCKED") {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                alert(
                    "ບັນຊີຂອງທ່ານຖືກບລັອກ\nກະລຸນາຕິດຕໍ່ Owner"
                );

                window.location.href = "/login";

                return Promise.reject(error);
            }

            // Token หมดอายุ / ไม่ถูกต้อง
            if (
                message === "Invalid token" ||
                message === "No token provided" ||
                message === "User not found"
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.href = "/login";

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;