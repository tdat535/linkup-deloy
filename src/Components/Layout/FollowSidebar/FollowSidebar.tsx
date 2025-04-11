import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../services/auth";
import { FiChevronDown, FiLogOut, FiSun, FiMoon, FiSettings } from "react-icons/fi";
import { useTheme } from "../../../context/ThemeContext";
import axios from "axios";
import React from "react";
import axiosInstance from "../../TokenRefresher";

const FollowSidebar = () => {
    const [user, setUser] = useState<{ username: string, email: string, phonenumber: string, avatar?: string } | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [avatar, setAvatar] = useState("");
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [followings, setFollowings] = useState<{ id: number; username: string; avatar: string }[]>([]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        const handleResize = () => setIsMobile(mediaQuery.matches);

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setAvatar(parsed.avatar || "https://via.placeholder.com/80");
        }

        const fetchFollowings = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const res = await axiosInstance.get("https://api-linkup.id.vn/api/follow/getFollow", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (res.data.isSuccess && res.data.following) {
                    console.log("data follow: ", res.data.following)
                    setFollowings(res.data.following);
                }
            } catch (err) {
                console.error("Lỗi khi lấy followings:", err);
            }
        };

        fetchFollowings();

        mediaQuery.addEventListener("change", handleResize);
        return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);

    const handleLogout = () => {
        logout();
    };

    const handleToAdmin = () => {
        navigate("/admin");
    };

    if (isMobile) {
        return (
            <header className={`fixed top-0 left-0 w-full z-50  ${theme === "dark" ? "bg-[#1C1C1D] text-white" : "bg-white text-black"} flex items-center p-4 border-b border-gray-300`}>
                <h1 className="text-lg font-semibold flex-1">𝓛𝓲𝓷𝓴𝓤𝓹</h1>
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2">
                        <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-gray-600" />
                        <FiChevronDown />
                    </button>
                    {isMenuOpen && (
                        <div className={`absolute right-0 mt-2 w-48 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-[#f0f2f5] text-black"} rounded-lg shadow-lg text-sm p-2`}>
                            <p className="px-4 py-2">{user?.username || "Khách"}</p>
                            <button onClick={toggleTheme} className="flex items-center w-full px-4 py-2">
                                {theme === "light" ? <FiMoon className="mr-2" /> : <FiSun className="mr-2" />}
                                {theme === "light" ? "Chế độ tối" : "Chế độ sáng"}
                            </button>
                            <button onClick={handleToAdmin} className="flex items-center w-full px-4 py-2"><FiSettings className="mr-2"/>Đến admin</button>
                            <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 rounded">
                                <FiLogOut className="mr-2" /> Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </header>
        );
    }

    return (
        <aside className={`fixed top-0 right-0 h-full w-64 p-4 border-l border-gray-300 ${theme === "dark" ? "bg-[#1C1C1D] text-white" : "bg-[#f0f2f5] text-black"}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full mr-3 object-cover" />
                    <span className="font-semibold">{user?.username || "Khách"}</span>
                </div>
                <button onClick={handleLogout} className="text-blue-500 text-sm hover:text-blue-700">Đăng xuất</button>
            </div>
            <h4 className="text-[#676869] mb-3 font-medium">Đã theo dõi</h4>
            <ul>
                {followings.map((user) => (
                    <li key={user.id} className="flex items-center gap-3 mb-3 hover:bg-gray-700 p-2 rounded-lg cursor-pointer transition duration-200">
                        <img src={user.avatar} alt={user.username} className="rounded-full w-9 h-9 border border-gray-400" />
                        <span className="text-md">{user.username}</span>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default FollowSidebar;
