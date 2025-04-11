import TextareaAutosize from "react-textarea-autosize";
import { useTheme } from "../../../context/ThemeContext";
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
  
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/80 p-4 md:p-6">
      <div 
        className={`w-full max-w-4xl flex flex-col md:flex-row rounded-xl shadow-2xl overflow-hidden mt-10 mb-16
                  ${post.image ? "" : "max-w-2xl"}
                  ${isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}`}
        style={{ height: "min(90vh, 800px)" }}
      >
        {/* Image section (if present) */}
        {post.image && (
          <div className={`w-full h-64 md:h-auto md:w-1/2 flex items-center justify-center p-2 
                        border-b md:border-b-0 md:border-r
                        ${isDark ? "border-gray-800 bg-black" : "border-gray-200 bg-gray-100"}`}>
            <img
              src={post.image}
              alt="Post content"
              className="max-w-full max-h-full rounded-lg object-contain"
            />
          </div>
        )}

        {/* Comments section */}
        <div className={`flex flex-col flex-1 min-h-0 ${post.image ? "md:w-1/2" : "w-full"}`}>
          {/* Header */}
          <div className={`flex justify-between items-center p-4 
                          ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <div className="flex items-center space-x-3">
              <img 
                src={post.avatar} 
                alt={`${post.name}'s avatar`} 
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500" 
              />
              <div className="flex flex-col">
                <span className="font-bold">{post.name}</span>
                <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{post.time}</span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className={`rounded-full p-2 transition-colors
                        ${isDark ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"} hover:text-gray-900`}
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Comments list */}
          <div
            className={`flex-1 overflow-y-auto p-4 space-y-4
                      ${isDark ? "bg-gray-900 border-t border-b border-gray-800" : 
                               "bg-gray-50 border-t border-b border-gray-200"}`}
          >
            {comments.length > 0 ? (
              comments.map((cmt, index) => (
                <div key={index} className="flex gap-3 group">
                  <img 
                    src="https://i.pravatar.cc/40" 
                    alt={`${cmt.user}'s avatar`} 
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
                  />
                  <div className="flex-1 space-y-1">
                    <div className={`rounded-xl p-3 ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{cmt.user}</span>
                        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{cmt.time}</span>
                      </div>
                      <p className="break-words whitespace-pre-wrap">{cmt.text}</p>
                    </div>
                    <div className="flex items-center space-x-2 px-2">
                      <button className="text-sm font-medium text-blue-400 hover:text-blue-300">
                        Thích ({cmt.likes})
                      </button>
                      <button className={`text-sm font-medium ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"}`}>
                        Phản hồi
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`flex flex-col items-center justify-center py-12 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="font-medium text-lg">Chưa có bình luận nào</p>
                <p className="text-sm mt-1">Hãy là người đầu tiên bình luận!</p>
              </div>
            )}
          </div>

          {/* Comment input - fixed at the bottom regardless of content height */}
          <div className={`p-4 ${isDark ? "bg-gray-900" : "bg-white"} flex-shrink-0`}>
            <div className={`flex items-center gap-3 rounded-full border overflow-hidden pr-2
                          ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-100"}`}
            >
              <TextareaAutosize
                minRows={1}
                maxRows={5}
                className={`w-full py-3 px-4 bg-transparent focus:outline-none resize-none
                          ${isDark ? "text-white" : "text-gray-800"}`}
                placeholder="Để lại bình luận..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <button 
                className={`rounded-full p-2 transition-colors disabled:opacity-50
                          ${comment.trim() 
                            ? "text-blue-400 hover:text-blue-300" 
                            : isDark ? "text-gray-500" : "text-gray-400"
                          }`}
                onClick={handleCommentSubmit}
                disabled={!comment.trim()}
                aria-label="Đăng bình luận"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;