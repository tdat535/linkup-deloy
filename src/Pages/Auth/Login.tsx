import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import axiosInstance from "../../Components/TokenRefresher";
import { useUser } from "../../context/UserContext"; // hoặc đường dẫn phù hợp

type FormData = {
  email: string;
  password: string;
  device: string;
};

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    device: "Unknown Device"
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const url = "https://api-linkup.id.vn/api/auth/login";

  const { setUser } = useUser();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) navigate("/home");
  }, [navigate]);

  useEffect(() => {
    const getOSInfo = async () => {
      const nav = navigator as any;
  
      if (nav.userAgentData && nav.userAgentData.getHighEntropyValues) {
        const ua = await nav.userAgentData.getHighEntropyValues(["platformVersion"]);

        // Windows 11 có platformVersion >= 13
        let osVersion = parseInt(ua.platformVersion.split(".")[0]) >= 13 ? "11" : "10";

        setFormData(prev => ({
          ...prev,
          device: `Windows ${osVersion} - Chrome ${nav.userAgentData.brands[2].version}`
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          device: "Không thể xác định hệ điều hành"
        }));
      }
    };
  
    getOSInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const body = { 
        email: formData.email, 
        password: formData.password, 
        device: formData.device 
      };
      
      console.log("📥 Request body:", body);
      console.log("📤 Sending request to:", url);

      const response = await axiosInstance.post(url, body, {
        withCredentials: true
      });

      console.log("📥 API Response:", response);

      if (!response.data) {
        throw new Error("Invalid API response!");
      }

      const {
        AccessToken,
        RefreshToken,
        Username,
        Email,
        Phonenumber,
        UserType,
        UserId,
        Avatar,
      } = response.data;

      if (AccessToken && RefreshToken) {
        localStorage.setItem("accessToken", AccessToken);
        localStorage.setItem("refreshToken", RefreshToken);
      
        const userData = {
          username: Username,
          email: Email,
          phonenumber: Phonenumber,
          userType: UserType,
          userId: UserId,
          avatar: Avatar,
        };
      
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("currentUserId", UserId);
      
        setUser(userData); // ✅ Cập nhật context ở đây
      
        console.log("✅ Login successful, redirecting...");
        if (UserType === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      
        window.location.reload();
      }
       else {
        throw new Error("Incomplete data returned!");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError("Đăng nhập thất bại. Vui lòng kiểm tra thông tin của bạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col md:flex-row items-center justify-center h-screen w-screen transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Logo Mobile */}
      <div className="md:hidden text-center w-full py-2.5 bg-blue-500 text-white text-2xl font-bold">
        <span className="bg-gradient-to-t from-sky-400 via-sky-300 to-sky-500 bg-clip-text text-transparent drop-shadow-lg">
          𝓛𝓲𝓷𝓴𝓤𝓹
        </span> - Chia sẻ niềm vui  
      </div>

      <div className="w-full max-w-5xl md:flex bg-white dark:bg-gray-800 shadow-lg overflow-hidden h-full md:h-auto">
        {/* Cột trái */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10 bg-blue-500 text-white">
          <div className='text-7xl text-center break-words text-white'>
            <span className="bg-gradient-to-t from-sky-400 via-sky-300 to-sky-500 bg-clip-text text-transparent drop-shadow-lg">
              𝓛𝓲𝓷𝓴𝓤𝓹
            </span>
          </div>
          <p className="text-lg mt-3">Chào mừng bạn trở lại! Hãy kết nối ngay.</p>
        </div>

        {/* Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đăng nhập</h1>
            <button
              className="p-3 rounded-xl bg-yellow-400 dark:bg-gray-700 text-gray-900 dark:text-white shadow-md hover:shadow-lg transition-all"
              onClick={() => setIsDarkMode(!isDarkMode)}
              type="button"
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-3 text-center bg-red-100 dark:bg-red-700 p-2 rounded-lg">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="grid gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 mt-1 outline-none border border-blue-500 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 mt-1 outline-none border border-blue-500 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
                placeholder="•••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold cursor-pointer transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <div className="flex justify-between items-center text-sm mt-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="dark:text-white">Nhớ tài khoản</span>
              </label>
              <a href="/forgot-password" className="text-blue-600 hover:underline dark:text-blue-300">Quên mật khẩu?</a>
            </div>

            <div className="flex items-center justify-center mt-4">
              <span className="h-px w-16 bg-gray-400 dark:bg-gray-600"></span>
              <span className="mx-2.5 dark:text-white">Hoặc</span>
              <span className="h-px w-16 bg-gray-400 dark:bg-gray-600"></span>
            </div>

            <button
              type="button"
              className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white py-3 rounded-lg text-lg font-semibold transition-all"
              onClick={() => navigate('/register')}
            >
              Đăng ký tài khoản mới
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;