
import TextareaAutosize from "react-textarea-autosize";
import { useTheme } from "../../../context/ThemeContext"
import React from "react";

interface Comment {
  user: string;
  text: string;
  time: string;
  likes: number;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    avatar: string;
    name: string;
    time: string;
    image?: string;
  };
  comments: Comment[];
  comment: string;
  setComment: (comment: string) => void;
  handleCommentSubmit: () => void;
}
const CommentModal: React.FC<CommentModalProps> = ({

  isOpen,
  onClose,
  post,
  comments,
  comment,
  setComment,
  handleCommentSubmit,
}) => {

  if (!isOpen) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-xs bg-black/50">
      <div
        className={`flex w-full lg:w-7xl h-full lg:h-[70%]  rounded-lg shadow-xl overflow-hidden ${post.image ? "flex-col lg:flex-row" : "flex-col w-full lg:w-[40%]"} ${theme === "dark" ? "bg-[#1C1C1D] text-white" : "bg-white text-black "}`}>
        {/* Ảnh bài đăng - Chỉ hiển thị nếu có ảnh */}
        {post.image && (
          <div className={`w-full  flex items-center justify-center p-1 border-b lg:border-b-0 lg:border-r border-gray-300} ${theme === "dark" ? " border-gray-500" : " border-gray-300"}`} >
            <img src={post.image} alt="Post" className="max-w-full max-h-full rounded-lg" />
          </div>
        )}

        {/* Bình luận */}
        <div className="w-full flex flex-col  h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 ">
            <div className="flex items-center">
              <img src={post.avatar} alt="Avatar" className="w-8 h-8 rounded-full mr-2 object-cover" />
              <span className="font-bold">{post.name}</span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✖</button>
          </div>

          {/* Danh sách bình luận */}
          <div className={`flex-1 overflow-y-auto p-4  space-y-5} ${theme === "dark" ? "bg-[#1C1C1D] border-t border-gray-500" : "bg-[#f0f2f5] border-t border-gray-200"}`}>
            {comments.length > 0 ? (
              comments.map((cmt, index) => (
                <div key={index} className="flex gap-3">
                  <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-bold">{cmt.user}</span>
                      <span className="text-gray-500 text-xs">{cmt.time}</span>
                    </div>
                    <p className=" break-all whitespace-pre-wrap">{cmt.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            )}
          </div>

          {/* Nhập bình luận */}
          <div className={`sticky bottom-0   p-2  flex items-center gap-3 ${theme === "dark" ? "bg-[#1C1C1D] border-t border-gray-500" : "bg-white border-t border-gray-200"}`}>
            <TextareaAutosize
              minRows={1}
              className="w-full p-2  bg-transparent focus:outline-none resize-none"
              placeholder="Để lại bình luận..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleCommentSubmit(); }
              }}
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={handleCommentSubmit}>
              Đăng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;