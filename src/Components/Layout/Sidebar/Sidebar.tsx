import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Search, MessageSquare, Bell, User, MoreHorizontal, Sun, Moon, Plus, Settings } from "lucide-react";
import { motion } from "framer-motion";
import PostButton from "../../Buttons/PostButton";
import PostModal from "../Modal/PostModal";
import { useTheme } from "../../../context/ThemeContext"; // Import useTheme
import React from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // Lấy theme và toggleTheme từ context
  const [isBottomNavVisible] = useState(true);
  const currentUserId = localStorage.getItem("currentUserId") || "default-id";
  const profileUrl = currentUserId !== "default-id" ? `/home/profile?userId=${currentUserId}` : "/login";
  return (
    <>
      <div className={`fixed top-0 left-0 h-screen w-64 border-r border-gray-300 text-xl p-4 z-50 hidden md:flex flex-col transition-all duration-300 ${theme === "dark" ? "bg-[#1C1C1D] text-white" : "bg-[#f0f2f5] text-black"}`}>
        <h1 className="text-3xl font-bold mb-12">𝓛𝓲𝓷𝓴𝓤𝓹</h1>

        <nav className="flex-1 space-y-7">
          <Link to="/home" className="flex items-center gap-4"><Home /> Trang chủ</Link>
          <Link to="/home/search" className="flex items-center gap-4"><Search /> Khám phá</Link>
          <Link to="/home/messages" className="flex items-center gap-4"><MessageSquare /> Tin nhắn</Link>
          <Link to="/home/notifications" className="flex items-center gap-4"><Bell /> Thông báo</Link>
          <Link to={profileUrl} className="flex items-center gap-4"><User /> Trang cá nhân</Link>
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-4">
              <MoreHorizontal /> Thêm
            </button>
            {isDropdownOpen && (
              <div className={`absolute left-0 top-full mt-2 w-48 rounded-lg z-50 ${theme === "dark" ? "bg-neutral-800 text-white" : "bg-neutral-200 text-black"}`}>
                <ul className="py-2">
                  <li>
                    <button onClick={toggleTheme} className={`flex items-center w-full px-4 py-2 text-sm  ${theme === "dark" ? "text-white hover:bg-neutral-700" : "text-black hover:bg-neutral-300"}`}>
                      {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                      <span className="ml-2">{theme === "light" ? "Chế độ sáng" : "Chế độ tối"}</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <Link to="/admin" className="flex items-center gap-4"><Settings />Đến trang admin</Link>
          <div className={`transition-all duration-300 ${isDropdownOpen ? "mt-16" : "mt-4"}`}>
            <PostButton text="Đăng" onClick={() => setIsOpen(true)} variant="primary" size="lg" fullWidth />
          </div>
        </nav>
      </div>
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isBottomNavVisible ? 0 : 100 }}
        transition={{ duration: 0.3 }}
        className={`fixed bottom-0 left-0 w-full border-t border-gray-600 md:hidden flex items-center justify-around z-50 ${theme === "dark" ? "bg-[#1C1C1D] text-white" : "bg-white text-black"}`}
      >
        <Link to="/home" className="p-3"><Home /></Link>
        <Link to="/home/search" className="p-3"><Search /></Link>
        <Link to="/home/messages" className="p-3"><MessageSquare /></Link>
        <Link to="/home/notifications" className="p-3"><Bell /></Link>
        <Link to="/home/profile" className="p-3"><User /></Link>
        <button onClick={() => setIsOpen(true)} className="bg-blue-500 p-2 text-white rounded-full shadow-lg">
          <Plus size={24} />
        </button>
      </motion.div>
      {isOpen && <PostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;
