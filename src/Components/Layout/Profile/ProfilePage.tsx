import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TextareaAutosize from "react-textarea-autosize";
import { useTheme } from "../../../context/ThemeContext";
import { useSocket } from "../../../context/SocketContext";
import ErrorPage from "../../Errorpage/Error";
import axiosInstance from "../../TokenRefresher";

const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const userId = String(searchParams.get("userId"));
  const currentUserId = String(localStorage.getItem("currentUserId"));
  const accessToken = localStorage.getItem("accessToken");

  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [followStatus, setFollowStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("https://via.placeholder.com/80");
  const [openModal, setOpenModal] = useState(false);
  const { theme } = useTheme();
  const socket = useSocket();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!userId || !currentUserId || !accessToken) {
      setError("Thiếu thông tin userId hoặc currentUserId.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(
          `https://api-linkup.id.vn/api/auth/profile?userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (response.data?.isSuccess) {
          const data = response.data;
          setProfileData(data);
          setUser(data);
          setName(data.username || "");
          setBio(data.bio || "");
          setAvatar(data.avatar || "/assets/default-avatar.png");
          setFollowStatus(data.followStatus || ""); // 👈 Cập nhật followStatus
        } else {
          setError("Không tìm thấy người dùng.");
        }
      } catch (err) {
        console.error("Lỗi khi lấy profile:", err);
        setError("Có lỗi xảy ra khi tải profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUserId, accessToken]);

  const handleFollow = async (userId: number) => {
    try {
      if (!currentUserId || !userId || Number(currentUserId) === userId) return;
  
      const response = await axiosInstance.post(
        "https://api-linkup.id.vn/api/follow/createFollow",
        { followingId: Number(userId) },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      if (response.data?.isSuccess) {
        setFollowStatus("Đang theo dõi"); // ✅ Cập nhật trạng thái ngay
  
        // ✅ Cập nhật followers ngay lập tức
        setProfileData((prev: any) => ({
          ...prev,
          followers: [
            ...(prev.followers || []),
            {
              id: Number(currentUserId),
              username: localStorage.getItem("currentUsername") || "Bạn",
              avatar: localStorage.getItem("currentAvatar") || "", // nếu có lưu avatar người dùng
            },
          ],
        }));
  
        if (socket) {
          socket.emit("follow", {
            followerId: Number(currentUserId),
            followingId: Number(userId),
          });
        }
      } else {
        console.error("Follow thất bại:", response.data);
      }
    } catch (err) {
      console.error("Lỗi khi follow:", err);
    }
  };

  const handleUnfollow = async (userId: number) => {
    try {
      const response = await axiosInstance.put(
        `https://api-linkup.id.vn/api/follow/unfollow`,
        { followingId: userId }, // gửi qua body
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      if (response.data?.isSuccess) {
        setFollowStatus("Theo dõi lại"); // 👈 cho phép follow lại
        setProfileData((prev: any) => ({
          ...prev,
          followers: (prev.followers || []).filter(
            (f: any) => f.id !== Number(currentUserId)
          ),
        }));
        
      } else {
        console.error("Unfollow thất bại:", response.data);
      }
    } catch (err) {
      console.error("Lỗi khi unfollow:", err);
    }
  };
  

  useEffect(() => {
    if (!socket) return;

    const handleFollowNotification = (data: any) => {
      console.log("📢 Có người vừa follow bạn:", data);
      alert(`🔔 ${data.follower?.username} vừa theo dõi bạn!`);

      setProfileData((prev: any) => ({
        ...prev,
        followers: [...(prev?.followers || []), { UserId: data.followerId }],
      }));
    };

    socket.on("followNotification", handleFollowNotification);

    return () => {
      socket.off("followNotification", handleFollowNotification);
    };
  }, [socket]); // ✅ Phụ thuộc socket

  const navigate = useNavigate();

  const handleClickUser = (userId: number) => {
    navigate("/home/messages", { state: { userId } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin text-blue-600 text-4xl">⏳</div>
      </div>
    );
  }

  if (error) return <ErrorPage />;

  if (!user || !profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl">Không có dữ liệu người dùng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div
        className={`fixed top-0 left-0 right-0 md:left-64 md:right-64 p-4 border-b border-gray-300 z-10 flex ${
          theme === "dark" ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <h2 className="text-lg font-bold">{name || "Profile"}</h2>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col max-w-4xl mx-auto sm:flex-row items-center gap-4 pt-20 pb-8 px-4">
        <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full" />
        <div className="flex-1">
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-gray-400 text-sm">{user?.email || ""}</p>
          <div className="flex gap-6 mt-4 text-center">
            <div>{profileData.posts?.length || 0} Bài viết</div>
            <div>{profileData.followers?.length || 0} Người theo dõi</div>
            <div>{profileData.following?.length || 0} Đang theo dõi</div>
          </div>
        </div>
        <div>
          <div className="flex gap-2">
            {followStatus === "Theo dõi" && (
              <button
                onClick={() => handleFollow(Number(userId))}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                Theo dõi
              </button>
            )}

            {followStatus === "Theo dõi lại" && (
              <button
                onClick={() => handleFollow(Number(userId))}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                Theo dõi lại
              </button>
            )}

            {followStatus === "Đang theo dõi" && (
              <>
                <button
                  onClick={() => handleUnfollow(Number(userId))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2 rounded-lg text-sm mr-2"
                >
                  Bỏ theo dõi
                </button>
                <button
                  onClick={() => handleClickUser(Number(userId))}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
                >
                  Nhắn tin
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {openModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
          <div
            className={`p-6 rounded-md w-full max-w-lg bg-white dark:bg-black text-black dark:text-white`}
          >
            <h2 className="text-lg font-bold mb-4">Chỉnh sửa hồ sơ</h2>
            <input
              type="text"
              placeholder="Tên"
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextareaAutosize
              className="w-full p-2 border rounded-md resize-none mt-4 dark:bg-gray-800 dark:text-white"
              minRows={2}
              maxRows={5}
              placeholder="Nhập tiểu sử (tối đa 160 ký tự)"
              value={bio}
              maxLength={160}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="text-sm text-right text-gray-500">{bio.length}/160</p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  // TODO: Gửi request cập nhật hồ sơ
                  setOpenModal(false);
                }}
              >
                Lưu
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => setOpenModal(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
