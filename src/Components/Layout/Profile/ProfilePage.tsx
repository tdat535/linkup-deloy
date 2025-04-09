// Đây là trang hồ sơ người dùng, 
// hiển thị thông tin cá nhân và các bài đăng của người dùng.

import { useEffect, useState, useRef } from "react";
import { FaHeart, FaComment, FaShare } from "react-icons/fa";
import TextareaAutosize from "react-textarea-autosize";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import ErrorPage from "../../Errorpage/Error";
import axiosInstance from "../../TokenRefresher";
import React from "react";

const ProfilePage = () => {
  // Khai báo các state
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const [user, setUser] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("https://via.placeholder.com/80");
  const [searchParams] = useSearchParams();
  const userId = String(searchParams.get("userId"));
  const currentUserId = String(localStorage.getItem("currentUserId"));
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("post");
  const { theme } = useTheme();
  // Ref để theo dõi xem component đã được mount hay chưa
  const isMounted = useRef(false);

  const accessToken = localStorage.getItem("accessToken");
  // Effect khi component được mount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  
   // 🟢 Effect lấy dữ liệu profile
   useEffect(() => {
    if (!userId || !currentUserId || !accessToken) {
      setError("Thiếu thông tin userId hoặc currentUserId.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for userId:", userId, "currentUserId:", currentUserId);

        const response = await axiosInstance.get(
          `https://api-linkup.id.vn/api/auth/profile?userId=${userId}&currentUserId=${currentUserId}`,{
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        console.log("API Response:", response.data);

        if (response.data && response.data.isSuccess) {
          const userData = response.data;
          setProfileData(userData);
          setUser(userData);
          setName(userData.username || "");
          setBio(userData.bio || "");
          setAvatar(userData.avatar || "/assets/default-avatar.png");

          // 🟢 Kiểm tra xem `currentUserId` có trong danh sách `followers` không
          if (Array.isArray(userData.followers)) {
            setIsFollowing(userData.followers.some((follower: { UserId: number; }) => follower.UserId === Number(currentUserId)));
          } else {
            setIsFollowing(false);
          }

          setLoading(false);
        } else {
          console.error("Invalid response:", response.data);
          setError("Không tìm thấy người dùng.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Lỗi khi lấy profile:", err);
        setError("Có lỗi xảy ra khi tải profile.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUserId, accessToken]);

  // 🟢 Hàm xử lý Follow khi bấm nút
  const handleFollow = async () => {
    if (!accessToken) return;

    try {
      if (isFollowing) {
        // 🟢 Nếu đang follow -> Unfollow
        await axiosInstance.post(
          "https://api-linkup.id.vn/api/follow/unfollow",
          { userId, followerId: currentUserId },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setIsFollowing(false);
      } else {
        // 🟢 Nếu chưa follow -> Follow
        const response = await axiosInstance.post(
          "https://api-linkup.id.vn/api/follow/createFollow",
          { userId, followerId: currentUserId },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (response.data?.followingId !== 0) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error("Lỗi khi Follow/Unfollow:", error);
    }
  };
  
  // Xử lý khi nhấn vào tab
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };
  console.log("profileData", profileData);

  // Render trạng thái loading hoặc lỗi
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div role="status">
        <svg aria-hidden="true" className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );

  if (error) return (
      <ErrorPage/>
  );

  if (!user || !profileData) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <p className="text-xl">Không có dữ liệu người dùng.</p>
        <p className="mt-2">Debug Info: userId={userId}, currentUserId={currentUserId}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1">
      <div className="">
        {/* Header */}
        <div className={`fixed top-0 left-0 right-0 md:left-64 md:right-64 p-4 border-b border-gray-300 z-10 flex ${theme === "dark" ? "bg-black text-white" :  "bg-white text-black"}`}>
          <div className="ml-4">
            <h2 className="text-lg font-bold">{name || "Profile"}</h2>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col max-w-4xl mx-auto sm:flex-row items-center gap-4 pt-20 pb-8 px-4">
          <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full" />
          <div className="flex-1">
            <h2 className="text-xl font-bold">{name || "User"}</h2>
            <p className="text-gray-400 text-sm">{user?.email || ""}</p>
            <div className="flex gap-6 mt-4 text-center">
              <div>{profileData.posts?.length || 0} Bài viết</div>
              <div>{profileData.followers?.length || 0} Người theo dõi bạn</div>
              <div>{profileData.following?.length || 0} Người bạn đang theo dõi</div>
            </div>
          </div>
          <div className="profile-header">
            {currentUserId === userId ? (
              <button onClick={() => setOpenModal(true)} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Chỉnh sửa hồ sơ</button>
            ) : (
              <button
                className={`focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 ${isFollowing ? "following" : ""}`}
                onClick={handleFollow}
              >
                {isFollowing ? "Đã theo dõi" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {openModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className= {` mt-10 p-6 rounded-md w-full max-w-md sm:max-w-lg md:max-w-xl h-full sm:h-auto overflow-y-auto  ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
              <h2 className="text-lg font-bold mb-4">Sửa Hồ Sơ</h2>
              <input
                type="text"
                placeholder="Tên"
                className="w-full p-2 border rounded-md bg-gray-800 text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextareaAutosize
                className="w-full p-2 border rounded-md resize-none mt-4 bg-gray-800 text-white"
                minRows={2}
                maxRows={5}
                placeholder="Nhập tiểu sử (tối đa 160 ký tự)"
                value={bio}
                maxLength={160}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-gray-400 text-sm text-right">{bio.length}/160</p>
              <div className="flex justify-end gap-2 mt-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => setOpenModal(false)}>
                  Lưu
                </button>
                <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={() => setOpenModal(false)}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts */}
        <div className="mt-4 max-w-5xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="mb-4 border-b border-gray-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
              <li className="me-2" role="presentation">
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTab === "post" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabClick("post")}
                  role="tab"
                  aria-selected={activeTab === "post"}
                >
                  Bài đăng
                </button>
              </li>
              <li className="me-2" role="presentation">
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTab === "followed" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabClick("followed")}
                  role="tab"
                  aria-selected={activeTab === "followed"}
                >
                  Người theo dõi
                </button>
              </li>
              <li className="me-2" role="presentation">
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${
                    activeTab === "follower" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => handleTabClick("follower")}
                  role="tab"
                  aria-selected={activeTab === "follower"}
                >
                  Đang theo dõi
                </button>
              </li>
            </ul>
          </div>

          {/* Nội dung các tab */}
          <div>
            {/* Nội dung tab Bài đăng */}
            <div 
              role="tabpanel" 
              aria-labelledby="post-tab"
              className={activeTab === "post" ? "" : "hidden"}
            >
              {/* Kiểm tra nếu có bài viết */}
              {profileData.posts && profileData.posts.length > 0 ? (
                profileData.posts.map((post: any) => (
                  <div key={post.id} className="p-4 border border-gray-700 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                      <div>
                        <h3 className="font-semibold">{name || "User"}</h3>
                        <p className="text-gray-400 text-sm">  {post.createdAt ? post.createdAt.split(".")[0].split("T")[1] + " " + post.createdAt.split(".")[0].split("T")[0].split("-").reverse().join("-"): "Vừa xong"}</p>
                      </div>
                    </div>
                    <p className="mt-2 p-2">{post.content}</p>
                    {post.image && <img src={post.image} className="w-full h-auto rounded-xl object-contain mb-4" />}
                    <div className="flex gap-4 mt-3 text-gray-400">
                      <FaHeart /> <FaComment /> <FaShare />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">Chưa có bài viết nào.</p>
              )}
            </div>
            
            {/* Nội dung tab Người theo dõi */}
            <div 
              role="tabpanel" 
              aria-labelledby="followed-tab"
              className={activeTab === "followed" ? "" : "hidden"}
            >
              {profileData.followers && profileData.followers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileData.followers.map((follower: any) => (
                    <div key={follower.id} className="p-4 border border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
                      <div className="flex items-center gap-3">
                        <img 
                          src={follower.avatar || "/assets/default-avatar.png"} 
                          alt={`${follower.username}'s avatar`} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold truncate">{follower.username || "Người dùng"}</h3>
                          <p className="text-gray-400 text-sm truncate">{follower.email || ""}</p>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors">
                          Xem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-gray-700 rounded-lg">
                  <p className="text-gray-400">Chưa có người theo dõi nào.</p>
                </div>
              )}
            </div>
            
            {/* Nội dung tab Đang theo dõi */}
            <div 
              role="tabpanel" 
              aria-labelledby="follower-tab"
              className={activeTab === "follower" ? "" : "hidden"}
            >
              {profileData.following && profileData.following.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileData.following.map((following: any) => (
                    <div key={following.id} className="p-4 border border-gray-700 rounded-lg hover:border-blue-500 transition-colors">
                      <div className="flex items-center gap-3">
                        <img 
                          src={following.avatar || "/assets/default-avatar.png"} 
                          alt={`${following.username}'s avatar`} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold truncate">{following.username || "Người dùng"}</h3>
                          <p className="text-gray-400 text-sm truncate">{following.email || ""}</p>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors">
                          Xem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 border border-gray-700 rounded-lg">
                  <p className="text-gray-400">Bạn chưa theo dõi ai.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;