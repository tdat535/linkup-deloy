import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import axiosInstance from "../../TokenRefresher";
import React from "react";

const Search = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const { theme } = useTheme();
    const userDataStr = localStorage.getItem("user");
    const userData = userDataStr ? JSON.parse(userDataStr) : null;
    const currentUserId = userData ? userData.userId : null;

    console.log("📌 currentUserId từ LocalStorage:", currentUserId);

    useEffect(() => {
        if (query.length > 1) {
            const timeoutId = setTimeout(async () => {
                try {
                    console.log("🔍 Đang tìm kiếm:", query);
                    const response = await axiosInstance.post(
                        `https://api-linkup.id.vn/api/auth/search`,
                        {
                            email: query,
                            username: query,
                            phonenumber: query,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    console.log("✅ Kết quả API:", response.data);
                    if (response.data && response.data.isSuccess && Array.isArray(response.data.data)) {
                        setResults(response.data.data);
                    } else {
                        setResults([]);
                    }
                } catch (error) {
                    console.error("❌ Lỗi API:", error);
                    setResults([]);
                }
            });

            return () => clearTimeout(timeoutId);
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSelectUser = (user: any) => {
        console.log("🔍 Selected user:", user);
        
        // Get user data from localStorage properly
        const userDataStr = localStorage.getItem("user");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const loggedInUserId = userData ? userData.userId : null;
        
        console.log("📌 currentUserId from userData:", loggedInUserId);
        
        // Get the selected user's ID (accounting for all possible property names)
        const selectedUserId = user.userId || user.userid || user.id;
        
        console.log("📌 Selected userId:", selectedUserId);
        
        if (selectedUserId && loggedInUserId) {
            navigate(`/home/profile?userId=${selectedUserId}`);
        } else {
            console.warn("❌ Không thể điều hướng, thiếu userId hoặc currentUserId!");
        }
    };
    
    
    useEffect(() => {
        const storedUserId = localStorage.getItem("currentUserId");
        if (!storedUserId) {
            // Redirect to login or show a message
            console.warn("User not logged in, redirecting...");
            navigate("/login");
        }
    }, []);
    
    
    return (
        <div className={`min-h-screen text-white p-4 flex flex-col items-center ${theme === 'dark' ? 'bg-[#1C1C1D]' : 'bg-[#f0f2f5]'}`}>
            <div className="w-full max-w-lg relative">
                {/* Ô input tìm kiếm */}
                <div className="relative">
                    <svg className={`w-6 h-6 absolute left-3 top-2.5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                    </svg>

                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        className={`pl-10 py-2 w-full border-none focus:ring-2 focus:ring-blue-500 rounded-lg ${theme === 'dark' ? 'bg-[#252728] text-white placeholder-gray-400' : 'bg-white text-black placeholder-gray-600'}`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    {/* Danh sách kết quả tìm kiếm */}
                    {results.length > 0 && (
                        <ul className="absolute w-full bg-gray-900 rounded-lg shadow-lg mt-2 max-h-60 overflow-y-auto">
                            {results.map((user) => (
                                <li
                                    key={user.userId || user.userid || user.id} // Update this line to use all possible ID fields
                                    onClick={() => handleSelectUser(user)}
                                    className="flex items-center p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800"
                                >
                                    <img
                                        src={user.avatar || "https://i.pravatar.cc/150"}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <div>
                                        <p className="text-white font-semibold">{user.username}</p>
                                        <p className="text-gray-400 text-sm">{user.email}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
