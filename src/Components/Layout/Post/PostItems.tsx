import React, { useEffect, useState } from "react";
import { HandThumbUpIcon, ChatBubbleOvalLeftIcon, ShareIcon } from "@heroicons/react/24/solid";
import { useTheme } from '../../../context/ThemeContext';
import CommentModal from "../Modal/CommentModal";
import { PostProps } from "./PostProps";

const PostItem: React.FC<{ post: PostProps }> = ({ post }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<{ user: string; text: string; time: string; likes: number }[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  const handleLike = async (postId: number) => {
    console.log("postid", post.id);

    const token = localStorage.getItem("accessToken");

    const response = await fetch('https://api-linkup.id.vn/api/like/createLike', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ postId })
    });
    console.log("response", response);
  }

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setComments([{ user: "You", text: comment, time: "Just now", likes: 0 }, ...comments]);
      setComment("");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.name,
        text: post.caption,
        url: window.location.href,
      });
    } else {
      alert("Trình duyệt không hỗ trợ chia sẻ!");
    }
  };

  const renderMedia = (mediaUrl: string | null) => {
    if (!mediaUrl) return null;

    // Kiểm tra nếu URL là hình ảnh (dựa trên phần mở rộng)
    const isImage = /\.(jpeg|jpg|gif|png|bmp|webp)$/i.test(mediaUrl);

    // Kiểm tra nếu URL là video (dựa trên phần mở rộng)
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

    if (isImage) {
      return <img src={mediaUrl} alt="Post" className="w-full h-auto rounded-xl object-contain mb-4" />;
    } else if (isVideo) {
      return (
        <video controls className="w-full h-auto rounded-xl mb-4">
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return null;
  };

  return (
    <>
      {/* Bài đăng */}
      <div className={`text-white mt-5 max-w-4xl mx-auto rounded-xl p-4 ${theme === 'dark' ? 'bg-[#252728]' : 'bg-white'}`}>
        <div className="flex items-center mb-4">
          <img src={post.avatar} alt="Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
          <div>
            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{post.name}</span>
            <span className="text-gray-500 text-sm ml-2">{post.time}</span>
          </div>
        </div>
        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{post.caption}</p>

        {/* Render Media (Image or Video) */}
        {renderMedia(post.image || null)}

        <div className="flex gap-5 text-gray-400">
          <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 hover:text-red-500">
            <HandThumbUpIcon className="w-5 h-5" /> <span>1</span>
          </button>

          <button onClick={() => setIsOpen(true)} className="hover:text-gray-300 flex items-center gap-1">
            <ChatBubbleOvalLeftIcon className="w-5 h-5" /> <span>{comments.length}</span>
          </button>

          <button onClick={handleShare} className="hover:text-blue-500 flex items-center gap-1">
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sử dụng Modal */}
      <CommentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        post={post}
        comments={comments}
        comment={comment}
        setComment={setComment}
        handleCommentSubmit={handleCommentSubmit}
      />
    </>
  );
};

export default PostItem;

