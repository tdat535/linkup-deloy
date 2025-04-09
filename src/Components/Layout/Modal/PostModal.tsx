import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import TextareaAutosize from "react-textarea-autosize";
import { useTheme } from "../../../context/ThemeContext";
import PostButton from "../../Buttons/PostButton";
import axiosInstance from "../../TokenRefresher";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<{
    username: string;
    email: string;
    phonenumber: string;
    realname: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const [content, setContent] = useState("");
  const { theme } = useTheme();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null); // Preview video
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null); // Video file
  const [isLoading, setIsLoading] = useState(false);
  const url = "https://api-linkup.id.vn/api/media/createMedia";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue.length > 250 ? newValue.slice(0, 250) : newValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type.split("/")[0]; // Lấy loại file (image hoặc video)

    if (fileType === "image") {
      setImage(file);
      setVideo(null); // Xóa video nếu đã chọn ảnh

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setVideoPreview(null);
      };
      reader.readAsDataURL(file);
    } else if (fileType === "video") {
      setVideo(file);
      setImage(null); // Xóa ảnh nếu đã chọn video

      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImage(null);
  };

  const handleRemoveVideo = () => {
    setVideoPreview(null);
    setVideo(null);
  };

  const handleConfirm = async () => {
    const userId = localStorage.getItem("currentUserId");
    const token = localStorage.getItem("accessToken");

    if (!userId) {
      console.log("Không tìm thấy ID người dùng.");
      setIsLoading(false);
      return;
    }
    if (!content.trim()) {
      console.log("Không tìm thấy nội dung bài viết");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);

      if (image) {
        formData.append("file", image);
        formData.append("type", "post");
      }
      if (video) {
        formData.append("file", video);
        formData.append("type", "video");
      } else {
        formData.append("type", "post");
      }

      for (let [key, value] of (formData as any).entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axiosInstance.post(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);

      if (response.status === 200) {
        setContent("");
        setImage(null);
        setVideo(null);
        setImagePreview(null);
        setVideoPreview(null);
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      console.log("Có lỗi xảy ra, vui lòng thử lại.");
    }
    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo bài viết mới"
      content={
        <div>
          <div className="flex items-center">
            <img
              src="https://media.tenor.com/9vTAoKqOXPQAAAAM/shrek-shrek-meme.gif"
              alt="Avatar"
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <span
              className={`font-semibold ${
                theme === "dark" ? "text-white" : "text-black"
              }`}
            >
              {user?.username}
            </span>
          </div>
          <div className="mt-2">
            <TextareaAutosize
              minRows={1}
              className={`rounded-lg p-2 w-full outline-none ${
                theme === "dark"
                  ? "bg-[#333334] text-white placeholder-gray-400"
                  : "bg-[#f0f2f5] text-black placeholder-gray-500"
              }`}
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={handleChange}
              style={{ resize: "none" }}
            />
          </div>
          <div className="mt-3 flex items-center">
            <label
              className={`block mb-2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Đính kèm ảnh hoặc video?
            </label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
              id="mediaUpload"
            />
            <label
              htmlFor="mediaUpload"
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ms-auto"
            >
              Chọn tệp
            </label>
          </div>

          {imagePreview && (
            <div className="mt-3 relative rounded border border-[#626466] p-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-0 right-0 bg-red-600 text-white p-2 py-1 text-sm rounded-full hover:bg-red-700"
              >
                X
              </button>
            </div>
          )}

          {videoPreview && (
            <div className="mt-3 relative rounded border border-[#626466] p-2">
              <video
                controls
                className="w-full max-h-64 object-cover rounded-lg shadow-md"
              >
                <source src={videoPreview} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button
                onClick={handleRemoveVideo}
                className="absolute top-0 right-0 bg-red-600 text-white p-2 py-1 text-sm rounded-full hover:bg-red-700"
              >
                X
              </button>
            </div>
          )}
        </div>
      }
      footer={
        <div className="flex justify-end space-x-2">
          <PostButton
            text={isLoading ? "Đang đăng..." : "Đăng bài"}
            onClick={handleConfirm}
            variant="primary"
            fullWidth
            disabled={isLoading}
          />
        </div>
      }
    />
  );
};

export default PostModal;
