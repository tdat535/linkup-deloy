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
  const [email, setEmail] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState("https://via.placeholder.com/80");

  const [formName, setFormName] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhoneNumber, setFormPhoneNumber] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [formAvatarFile, setFormAvatarFile] = useState<File | null>(null);

  const [openModal, setOpenModal] = useState(false);
  const { theme } = useTheme();
  const socket = useSocket();
  const navigate = useNavigate();
  const isMounted = useRef(false);

  // Fetch profile
  useEffect(() => {
    isMounted.current = true;

    if (!userId || !currentUserId || !accessToken) {
      setError("Thiếu thông tin userId hoặc currentUserId.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(
          `https://api-linkup.id.vn/api/auth/profile?userId=${userId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.data?.isSuccess) {
          const data = response.data;
          setUser(data);
          setProfileData(data);
          setName(data.username || "");
          setBio(data.bio || "");
          setEmail(data.email || "");
          setPhoneNumber(data.phonenumber || "");
          setAvatar(data.avatar || "/assets/default-avatar.png");
          setFollowStatus(data.followStatus || "");
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

    return () => {
      isMounted.current = false;
    };
  }, [userId, currentUserId, accessToken]);

  // Follow user
  const handleFollow = async (userId: number) => {
    try {
      if (!currentUserId || !userId || Number(currentUserId) === userId) return;

      const response = await axiosInstance.post(
        "https://api-linkup.id.vn/api/follow/createFollow",
        { followingId: Number(userId) },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data?.isSuccess) {
        setFollowStatus("Đang theo dõi");
        setProfileData((prev: any) => ({
          ...prev,
          followers: [
            ...(prev.followers || []),
            {
              id: Number(currentUserId),
              username: localStorage.getItem("currentUsername") || "Bạn",
              avatar: localStorage.getItem("currentAvatar") || "",
            },
          ],
        }));

        socket?.emit("follow", {
          followerId: Number(currentUserId),
          followingId: Number(userId),
        });
      }
    } catch (err) {
      console.error("Lỗi khi follow:", err);
    }
  };

  // Unfollow user
  const handleUnfollow = async (userId: number) => {
    try {
      const response = await axiosInstance.put(
        `https://api-linkup.id.vn/api/follow/unfollow`,
        { followingId: userId },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.data?.isSuccess) {
        setFollowStatus("Theo dõi lại");
        setProfileData((prev: any) => ({
          ...prev,
          followers: (prev.followers || []).filter(
            (f: any) => f.id !== Number(currentUserId)
          ),
        }));
      }
    } catch (err) {
      console.error("Lỗi khi unfollow:", err);
    }
  };

  // Update profile
  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("username", formName);
      if (/\s/.test(formName)) {
        alert("Tên người dùng không được chứa khoảng trắng.");
        return;
      }
      formData.append("bio", formBio);
      formData.append("email", formEmail);
      formData.append("phonenumber", formPhoneNumber);
      if (formAvatarFile) formData.append("avatar", formAvatarFile);

      const res = await axiosInstance.put(
        `http://192.168.5.54:4000/api/auth/updateProfile`,
        formData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      console.log(res);

      if (res.data?.isSuccess) {
        alert("Cập nhật hồ sơ thành công!");
        setOpenModal(false);
        setName(formName);
        setBio(formBio);
        setEmail(formEmail);
        setPhoneNumber(formPhoneNumber);
        if (res.data && res.data.user) {
          console.log("new data: ", res.data);

          const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
          const newUserData = res.data.user;

          const updatedUser = {
            ...existingUser, // giữ lại các field khác nếu có
            username: newUserData.username || existingUser.username,
            email: newUserData.email || existingUser.email,
            phonenumber: newUserData.phonenumber || existingUser.phonenumber,
            avatar: newUserData.avatar || existingUser.avatar,
          };

          console.log("data sau khi cập nhật", updatedUser);

          localStorage.setItem("user", JSON.stringify(updatedUser));
          setOpenModal(false); // Đóng modal sau khi lưu
        }
      } else {
        alert("Cập nhật thất bại.");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      alert("Có lỗi xảy ra khi cập nhật hồ sơ.");
    }
  };

  // Realtime socket follow notification
  useEffect(() => {
    if (!socket) return;

    const handleFollowNotification = (data: any) => {
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
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin text-blue-600 text-4xl">⏳</div>
      </div>
    );
  }

  const handleClickUser = (userId: number) => {
    navigate("/home/messages", { state: { userId } });
  };

  if (error) return <ErrorPage />;

  if (!user || !profileData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Không có dữ liệu người dùng.</p>
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

      {/* Profile Info */}
      <div className="flex flex-col max-w-4xl mx-auto sm:flex-row items-center gap-4 pt-20 pb-8 px-4">
        <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full" />
        <div className="flex-1">
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-gray-400 text-sm">{email}</p>
          <div className="flex gap-6 mt-4 text-center">
            <div>{profileData.posts?.length || 0} Bài viết</div>
            <div>{profileData.followers?.length || 0} Người theo dõi</div>
            <div>{profileData.following?.length || 0} Đang theo dõi</div>
          </div>
        </div>
        <div>
          {!followStatus ? (
            <button
              onClick={() => {
                setFormName(name);
                setFormBio(bio);
                setFormEmail(email);
                setFormPhoneNumber(phonenumber);
                setFormAvatar(avatar);
                setFormAvatarFile(null);
                setOpenModal(true);
              }}
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium px-4 py-2 rounded-lg text-sm"
            >
              Chỉnh sửa hồ sơ
            </button>
          ) : followStatus === "Đang theo dõi" ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleClickUser(Number(userId))}
                className="text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm"
              >
                Nhắn tin
              </button>
              <button
                onClick={() => handleUnfollow(Number(userId))}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
              >
                Hủy theo dõi
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleFollow(Number(userId))}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
            >
              Theo dõi
            </button>
          )}
        </div>
      </div>

      {/* Modal chỉnh sửa hồ sơ */}
      {openModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="p-6 rounded-md w-full max-w-lg bg-white dark:bg-black text-black dark:text-white">
            <h2 className="text-lg font-bold mb-4 text-center">
              Chỉnh sửa hồ sơ
            </h2>
            <div className="flex flex-col items-center space-y-2 mb-4">
              {formAvatar && (
                <img
                  src={formAvatar}
                  alt="Xem trước"
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormAvatarFile(file);
                    setFormAvatar(URL.createObjectURL(file));
                  }
                }}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tên người dùng"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
              />
              <TextareaAutosize
                className="w-full p-2 border rounded-md resize-none dark:bg-gray-800 dark:text-white"
                minRows={2}
                maxRows={5}
                placeholder="Nhập tiểu sử (tối đa 160 ký tự)"
                value={formBio}
                maxLength={160}
                onChange={(e) => setFormBio(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={formPhoneNumber}
                onChange={(e) => setFormPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
              />
              <p className="text-sm text-right text-gray-500">
                {formBio.length}/160
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={handleUpdateProfile}
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

      {/* Danh sách bài viết */}
      <div className="max-w-4xl mx-auto px-4 pb-10">
        <h3 className="text-lg font-semibold mb-4">Bài viết</h3>
        {profileData.posts && profileData.posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profileData.posts.map((post: any) => {
              const isImage = post.mediaUrl?.match(
                /\.(jpeg|jpg|png|gif|webp)$/i
              );
              const isVideo = post.mediaUrl?.match(/\.(mp4|webm|ogg|mov)$/i);

              return (
                <div
                  key={post.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {isImage && (
                    <img
                      src={post.mediaUrl}
                      alt="Post media"
                      className="w-full h-60 object-cover"
                    />
                  )}

                  {isVideo && (
                    <video
                      controls
                      className="w-full h-60 object-cover bg-black"
                    >
                      <source src={post.mediaUrl} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  )}

                  <div className="p-3">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {post.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(post.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">Người dùng chưa có bài viết nào.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
