import React, { useEffect, useState } from "react";
import {
  HandThumbUpIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";
import { useTheme } from "../../../context/ThemeContext";
import CommentModal from "../Modal/CommentModal";
import { PostProps } from "./PostProps";
import axiosInstance from "../../TokenRefresher";

const PostItem: React.FC<{ post: PostProps }> = ({ post }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    { user: string; text: string; time: string; likes: number }[]
  >([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".relative")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLike = async (postId: number) => {
    console.log("postid", post.id);

    const token = localStorage.getItem("accessToken");

    const response = await fetch(
      "https://api-linkup.id.vn/api/like/createLike",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      }
    );
    console.log("response", response);
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      setComments([
        { user: "You", text: comment, time: "Just now", likes: 0 },
        ...comments,
      ]);
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

  const reportPost = async (reportedPostId: number, reason: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.post(
        "https://api-linkup.id.vn/api/report/reportPost",
        {
          reportedPostId,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
      setDropdownOpen(false); // Đóng dropdown sau khi báo cáo
    } catch (error: any) {
      console.error("Error reporting post:", error);
      throw error.response?.data || { message: "Có lỗi xảy ra khi báo cáo." };
    }
  };

  const renderMedia = (mediaUrl: string | null) => {
    if (!mediaUrl) return null;

    // Kiểm tra nếu URL là hình ảnh (dựa trên phần mở rộng)
    const isImage = /\.(jpeg|jpg|gif|png|bmp|webp)$/i.test(mediaUrl);

    // Kiểm tra nếu URL là video (dựa trên phần mở rộng)
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);

    if (isImage) {
      return (
        <img
          src={mediaUrl}
          alt="Post"
          className="w-full h-auto rounded-xl object-contain mb-4"
        />
      );
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
      <div
        className={`text-white mt-5 max-w-4xl mx-auto rounded-xl p-4 ${
          theme === "dark" ? "bg-[#252728]" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src={post.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full mr-2 object-cover"
            />
            <div>
              <span
                className={`font-bold ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                {post.name}
              </span>
              <span className="text-gray-500 text-sm ml-2">{post.time}</span>
            </div>
          </div>

          {/* Nút 3 chấm và Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="text-black hover:text-gray-800 text-xl"
            >
              &#8942;
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <button
                  onClick={() => {
                    setIsReportModalOpen(true); // Mở modal
                    setDropdownOpen(false); // Đóng dropdown
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-black"
                >
                  Báo cáo bài viết
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nội dung bài đăng */}

        <p
          className={`mb-4 ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {post.caption}
        </p>

        {/* Render Media (Image or Video) */}
        {renderMedia(post.image || null)}

        <div className="flex gap-5 text-gray-400">
          <button
            onClick={() => handleLike(post.id)}
            className="flex items-center gap-1 hover:text-red-500"
          >
            <HandThumbUpIcon className="w-5 h-5" /> <span>1</span>
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="hover:text-gray-300 flex items-center gap-1"
          >
            <ChatBubbleOvalLeftIcon className="w-5 h-5" />{" "}
            <span>{comments.length}</span>
          </button>

          <button
            onClick={handleShare}
            className="hover:text-blue-500 flex items-center gap-1"
          >
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

      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-black">
              Báo cáo bài viết
            </h3>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
            >
              <option value="">Chọn lý do</option>
              <option value="spam">Spam</option>
              <option value="violence">Nội dung phản cảm</option>
              <option value="fake">Thông tin sai sự thật</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  try {
                    await reportPost(post.id, reason);
                    alert("Báo cáo thành công");
                    setIsReportModalOpen(false);
                    setReason("");
                  } catch (err: any) {
                    alert(err.message || "Báo cáo thất bại");
                  }
                }}
                disabled={!reason}
                className={`px-4 py-2 text-sm rounded ${
                  reason
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostItem;
