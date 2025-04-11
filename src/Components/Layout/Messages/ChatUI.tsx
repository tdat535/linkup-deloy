import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Image, Smile, Paperclip, Search, MessageSquare } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import axios from "axios";
import { Messenger } from "./Messenger";
import { MessengerDetail } from "./MessengerDetail";
import { User } from "./User";
import { useSocket } from "../../../context/SocketContext";
import axiosInstance from "../../TokenRefresher";
import { useLocation } from "react-router-dom";
import { useTheme as useAppTheme } from "../../../context/ThemeContext";

const ChatPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState<Messenger[]>([]);
  const [messages, setMessages] = useState<MessengerDetail[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentUserId = Number(localStorage.getItem("currentUserId"));

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Use theme context
  const { theme, toggleTheme } = useAppTheme();
  const isDarkMode = theme === "dark";

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const socket = useSocket();

  useEffect(() => {
    if (!socket || !currentUserId) return;

    socket.on("receiveMessage", (newMessage: MessengerDetail) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("notification");
    };
  }, [socket, currentUserId]);

  const location = useLocation();
  const userIdFromState = location.state?.userId;

  useEffect(() => {
    if (userIdFromState) {
      loadConversation(userIdFromState);
    }
  }, [userIdFromState]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          "https://api-linkup.id.vn/api/texting/getMessenger",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              withCredentials: true,
            },
          }
        );
        if (res.data.isSuccess) {
          setConversations(res.data.data);
        }
      } catch (err) {
        console.error("Lỗi khi fetch hội thoại:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const loadConversation = async (userId: string) => {
    try {
      const res = await axiosInstance.get(
        "https://api-linkup.id.vn/api/texting/getMessengerDetail",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          params: { otherUserId: userId },
        }
      );
  
      if (res.data.isSuccess) {
        const messageList: MessengerDetail[] = res.data.data;
        setMessages(messageList);
        setIsChatOpen(true);
  
        if (messageList.length > 0) {
          const msg = messageList[0];
          if (msg.senderId !== currentUserId) {
            setOtherUser(msg.sender); // sender là người còn lại
          }
        } else {
          // Nếu chưa có tin nhắn, tạo cuộc trò chuyện rỗng
          const found = conversations.find(
            (c) => c.user.id.toString() === userId
          );
  
          if (found) {
            setOtherUser(found.user);
          } else {
            // Nếu chưa nằm trong danh sách hội thoại -> gọi API lấy thông tin user
            const userRes = await axiosInstance.get(
              `https://api-linkup.id.vn/api/auth/profile?userId=${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              }
            );
  
            if (userRes.data.isSuccess) {
              setOtherUser({
                id: userRes.data.UserId,
                username: userRes.data.username,
                avatar: userRes.data.avatar,
                isOnline: userRes.data.isOnline || false // Default to false if not provided
              });
            }
          }
  
          // Tạo danh sách tin nhắn rỗng
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết tin nhắn:", err);
    }
  };
  

  const sendMessage = () => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  
    if (!input.trim()) {
      console.warn("⛔ Không thể gửi tin nhắn: thiếu nội dung tin nhắn (input rỗng)");
      return;
    }
  
    if (!otherUser) {
      console.warn("⛔ Không thể gửi tin nhắn: chưa có người nhận (otherUser null)");
      return;
    }
  
    if (!socket) {
      console.warn("⛔ Không thể gửi tin nhắn: socket chưa sẵn sàng");
      return;
    }
  
    const message = {
      senderId: currentUserId,
      receiverId: otherUser.id,
      content: input.trim(),
      image: null,
    };
  
    console.log("📤 Gửi tin nhắn qua socket:", message);
    socket.emit("sendMessage", message);
  
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: input.trim(),
        image: null,
        receivingDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        senderId: currentUserId,
        receiverId: otherUser.id,
        sender: {
          id: currentUserId,
          username: "Tôi",
          avatar: currentUser.avatar || null,
          isOnline: false, // Default value for isOnline
        },
      },
    ]);
  
    setInput("");
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        return '';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar trái */}
      <aside
        className={`fixed inset-0 md:relative md:inset-auto ${
          isDarkMode
            ? "bg-[#1C1C1D] text-white border-r border-gray-700"
            : "bg-[#f0f2f5] border-r border-gray-300 text-gray-800"
        } md:w-80 shadow-lg z-30 transition-all duration-300 ${isChatOpen ? "hidden md:block" : ""}`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="text-xl font-bold mb-4 flex items-center justify-between">
            <span>Tin nhắn</span>
            <button
              className={`p-2 rounded-full ${
                isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
              }`}
              onClick={toggleTheme}
            >
              {isDarkMode ? "🌞" : "🌙"}
            </button>
          </div>

          {/* Search box */}
          <div className={`mb-4 relative ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 pr-10 rounded-full ${
                isDarkMode
                  ? "bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  : "bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              }`}
            />
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>

          {/* Danh sách hội thoại */}
          <div className="overflow-y-auto flex-1 -mx-4 px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "Không tìm thấy kết quả" : "Chưa có cuộc trò chuyện nào"}
              </div>
            ) : (
              conversations.map((conv, index) => (
                <div
                  key={index}
                  className={`p-3 mb-2 flex items-center gap-3 cursor-pointer rounded-xl transition-all ${
                    otherUser?.id === conv.user.id
                      ? isDarkMode ? "bg-gray-700" : "bg-blue-50"
                      : isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  onClick={() => loadConversation(conv.user.id.toString())}
                >
                  <div className="relative">
                    <img
                      className="w-12 h-12 rounded-full object-cover"
                      src={conv.user.avatar || "/default-avatar.jpg"}
                      alt="Avatar"
                    />
                    {conv.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{conv.user.username}</h3>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className={`text-sm truncate ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      } ${conv.unreadCount > 0 ? "font-semibold" : ""}`}>
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Chi tiết chat */}
      <div
        className={`flex-1 flex flex-col h-full ${
          !isChatOpen ? "hidden md:flex" : ""
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b sticky top-0 left-0 right-0 z-20 flex items-center justify-between ${
            isDarkMode
              ? "bg-[#1C1C1D] text-white border-gray-700"
              : "bg-white text-gray-800 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              className={`md:hidden p-2 rounded-full ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              onClick={() => setIsChatOpen(false)}
            >
              <ArrowLeft size={20} />
            </button>
            {otherUser ? (
              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={otherUser.avatar || "/default-avatar.jpg"}
                  alt="Avatar"
                />
                <div>
                  <h3 className="font-medium">{otherUser.username}</h3>
                  <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {otherUser.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
                  </span>
                </div>
              </div>
            ) : (
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Chọn cuộc trò chuyện
              </span>
            )}
          </div>
        </div>

        {/* Nội dung tin nhắn */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-2 ${
            isDarkMode
              ? "bg-[#1C1C1D] text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageSquare size={48} className={isDarkMode ? "text-gray-600" : "text-gray-400"} />
              <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {otherUser ? "Hãy bắt đầu cuộc trò chuyện" : "Chọn một người để trò chuyện"}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isCurrentUser = msg.senderId === currentUserId;
                const showAvatar = index === 0 ||
                    messages[index - 1].senderId !== msg.senderId;

                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} items-end gap-2`}
                  >
                    {!isCurrentUser && showAvatar && (
                      <img
                        className="w-8 h-8 rounded-full object-cover mb-1"
                        src={msg.sender?.avatar || "/default-avatar.jpg"}
                        alt="Avatar"
                      />
                    )}
                    {!isCurrentUser && !showAvatar && (
                      <div className="w-8"></div>
                    )}
                    <div
                      className={`break-all whitespace-pre-wrap max-w-[75%] p-3 rounded-2xl ${
                        isCurrentUser
                          ? `${isDarkMode ? "bg-blue-600" : "bg-blue-500"} text-white rounded-br-none`
                          : isDarkMode
                              ? "bg-gray-800 text-white rounded-bl-none"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                      <div className={`text-right mt-1 text-xs ${
                        isCurrentUser
                          ? "text-blue-200"
                          : isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                    {isCurrentUser && showAvatar && (
                      <img
                        className="w-8 h-8 rounded-full object-cover mb-1"
                        src={JSON.parse(localStorage.getItem("user") || "{}").avatar || "/default-avatar.jpg"}
                        alt="Avatar"
                      />
                    )}
                    {isCurrentUser && !showAvatar && (
                      <div className="w-8"></div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Nhập tin nhắn */}
        <div
          className={`p-3 shadow-lg sticky bottom-0 left-0 right-0 ${
            isDarkMode
              ? "bg-[#1C1C1D] text-white border-t border-gray-700"
              : "bg-white border-t border-gray-200 text-gray-800"
          }`}
        >
          <div className={`flex items-center p-1 rounded-full ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          }`}>
            <button className={`p-2 rounded-full ${
              isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"
            }`}>
              <Paperclip size={20} />
            </button>
            <button className={`p-2 rounded-full ${
              isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"
            }`}>
              <Image size={20} />
            </button>
            <TextareaAutosize
              className={`w-full p-2 mx-2 bg-transparent resize-none focus:outline-none ${
                isDarkMode ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"
              }`}
              minRows={1}
              maxRows={4}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button className={`p-2 rounded-full ${
              isDarkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"
            }`}>
              <Smile size={20} />
            </button>
            <button
              className={`p-2 rounded-full ${
                input.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"
              }`}
              onClick={sendMessage}
              disabled={!input.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;