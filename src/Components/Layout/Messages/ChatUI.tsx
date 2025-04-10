import { useEffect, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import axiosInstance from "../../TokenRefresher";
import React from "react";
import { connectSocket, disconnectSocket, getSocket } from "../../socket";
import axios from "axios";
import { MessengerDetail } from "./MessengerDetail";
import { Messenger } from "./Messenger";
import { User } from "./User";

const ChatPage = ({ theme }: { theme: string }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState<Messenger[]>([]);
  const [messages, setMessages] = useState<MessengerDetail[]>([]);
  const [input, setInput] = useState("");
  const [otherUser, setOtherUser] = useState<User>({
    id: 0,
    username: "",
    avatar: "",
  });
  const currentUserId = localStorage.getItem("currentUserId");

  useEffect(() => {
    const userId = localStorage.getItem("currentUserId");
    if (!userId) return;
  
    const socketInstance = connectSocket();
  
    socketInstance.emit("userOnline", Number(userId));
  
    socketInstance.on("receiveMessage", (newMessage: MessengerDetail) => {
      setMessages((prev) => [...prev, newMessage]);
    });
  
    socketInstance.on("notification", (data) => {
      console.log("🔔 Notification:", data);
    });
  
    return () => {
      socketInstance.off("receiveMessage");
      socketInstance.off("notification");
      disconnectSocket(); // Cleanup
    };
  }, []);
  

  // Lấy danh sách hội thoại
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

  // Hàm tải chi tiết tin nhắn khi chọn user
  const loadConversation = async (userId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token || !userId) return;

    try {
      const res = await axios.get(
        "https://api-linkup.id.vn/api/texting/getMessengerDetail",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { otherUserId: userId },
        }
      );

      if (res.data.isSuccess) {
        console.log("Dữ liệu chi tiết tin nhắn:", res.data.data);
        setMessages(res.data.data);
        const messageData = res.data.data.find(
          (msg: MessengerDetail) =>
            msg.senderId === Number(userId) || msg.receiverId === Number(userId)
        );
        
        if (messageData) {
          const user =
            messageData.senderId === Number(userId)
              ? messageData.sender
              : messageData.senderId === Number(currentUserId)
              ? messageData.receiver
              : null;
        
          if (user) {
            setOtherUser({
              id: user.id,
              username: user.username || "Unknown",
              avatar:
                user.avatar ||
                "https://i.pinimg.com/236x/5e/e0/82/5ee082781b8c41406a2a50a0f32d6aa6.jpg",
            });
          }
        }        
        setIsChatOpen(true);
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết tin nhắn:", err);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !otherUser.username) return;
  
    const senderId = Number(currentUserId);
    const receiverId = conversations.find(c => c.user.username === otherUser.username)?.user.id;
  
    if (!receiverId) return;
  
    const messageData = {
      senderId,
      receiverId,
      content: input.trim(),
      image: null,
    };
  
    try {
      const socketInstance = getSocket();
      socketInstance.emit("sendMessage", messageData);
    } catch (err) {
      console.error("Socket chưa được kết nối:", err);
    }
  
    // UI Preview
    setMessages((prev) => [...prev, {
      id: Date.now(),
      content: input.trim(),
      image: null,
      receivingDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      senderId: senderId,
      receiverId: receiverId,
      sender: {
        id: senderId,
        username: "Tôi",
        avatar: null,
      },
    }]);
  
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
              {/* Nếu người gửi không phải currentUserId, ảnh nằm phía trước */}
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

              {/* Nếu người gửi là currentUserId, ảnh nằm phía sau */}
              {msg.sender?.id === Number(currentUserId) && (
                <img
                  className="w-8 h-8 rounded-full"
                  src={msg.sender?.avatar || "/default-avatar.jpg"}
                  alt="Avatar"
                />
              )}
            </div>
          ))}
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
