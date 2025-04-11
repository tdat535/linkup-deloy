import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import axios from "axios";
import { Messenger } from "./Messenger";
import { MessengerDetail } from "./MessengerDetail";
import { User } from "./User";
import { useSocket } from "../../../context/SocketContext";
import axiosInstance from "../../TokenRefresher";
import { useLocation } from "react-router-dom";

const ChatPage = ({ theme }: { theme: string }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState<Messenger[]>([]);
  const [messages, setMessages] = useState<MessengerDetail[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const currentUserId = Number(localStorage.getItem("currentUserId"));

  const bottomRef = useRef<HTMLDivElement | null>(null);

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
                avatar: userRes.data.avatar
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
        },
      },
    ]);
  
    setInput("");
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar trái */}
      <aside
        className={`fixed inset-0 md:left-64 ${
          theme === "dark"
            ? "bg-[#1C1C1D] text-white border-r border-gray-500"
            : "bg-[#f0f2f5] border-r border-gray-300 text-black"
        } md:w-64 shadow-lg z-50 ${isChatOpen ? "hidden md:block" : ""}`}
      >
        <ul>
          {conversations.map((conv, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-500 border-b border-gray-400 flex items-center gap-2 cursor-pointer"
              onClick={() => loadConversation(conv.user.id.toString())}
            >
              <img
                className="w-10 h-10 rounded-full"
                src={conv.user.avatar || "/default-avatar.jpg"}
                alt="Avatar"
              />
              <span>{conv.user.username}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Chi tiết chat */}
      <div
        className={`flex-1 flex flex-col ml-0 md:ml-64 z-50 h-full ${
          !isChatOpen ? "hidden md:flex" : ""
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b border-gray-400 sticky left-0 right-0 md:left-128 md:right-0 flex items-center ${
            theme === "dark" ? "bg-[#1C1C1D] text-white" : "bg-white text-black"
          }`}
        >
          <button
            className={`md:hidden p-2 rounded ${
              theme === "dark" ? "bg-[#1C1C1D]" : "bg-white"
            }`}
            onClick={() => setIsChatOpen(false)}
          >
            <ArrowLeft size={24} />
          </button>
          <img
            className="w-10 h-10 rounded-full"
            src={otherUser?.avatar || "/default-avatar.jpg"}
            alt="Avatar"
          />
          <span
            className={`ml-4 ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            {otherUser?.username || "Chọn cuộc trò chuyện"}
          </span>
        </div>

        {/* Nội dung tin nhắn */}
        <div
          className={`flex-1 overflow-y-auto p-10 space-y-2 max-h-[calc(100vh-100px)] ${
            theme === "dark"
              ? "bg-[#1C1C1D] text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender?.id === Number(currentUserId)
                  ? "justify-end"
                  : "justify-start"
              } items-center gap-2`}
            >
              {/* Avatar bên trái nếu là người khác */}
              {msg.sender?.id !== Number(currentUserId) && (
                <img
                  className="w-8 h-8 rounded-full"
                  src={msg.sender?.avatar || "/default-avatar.jpg"}
                  alt="Avatar"
                />
              )}

              {/* Tin nhắn */}
              <div
                className={`break-all whitespace-pre-wrap max-w-[80%] md:max-w-[60%] p-3 rounded-lg ${
                  msg.sender?.id === Number(currentUserId)
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.content}
              </div>

              {/* Avatar bên phải nếu là mình */}
              {msg.sender?.id === Number(currentUserId) && (
                <img
                  className="w-8 h-8 rounded-full"
                  src={msg.sender?.avatar || "/default-avatar.jpg"}
                  alt="Avatar"
                />
              )}
            </div>
          ))}

          {/* Phần tử để scroll tới */}
          <div ref={bottomRef} />
        </div>

        {/* Nhập tin nhắn */}
        <div
          className={`p-4 shadow-lg sticky bottom-0 left-0 right-0 md:left-128 md:right-0 ${
            theme === "dark"
              ? "bg-[#1C1C1D] text-white"
              : "bg-[#f0f2f5] text-black"
          }`}
        >
          <div className="flex items-center">
            <TextareaAutosize
              className="w-full p-2 border rounded-lg resize-none focus:outline-none"
              minRows={1}
              maxRows={5}
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
            <button
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={sendMessage}
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatPage;
