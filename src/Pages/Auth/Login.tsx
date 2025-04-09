import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import axiosInstance from "Components/TokenRefresher";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [device, setDevice] = useState("Unknown Device");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const url = "https://api-linkup.id.vn/api/auth/login";
  const [isSun, setIsSun] = useState<boolean>(true);

    // useEffect(() => {
    //   const accesstoken = localStorage.getItem("accessToken");
    
    //   if (accesstoken) {
    //     navigate("/home"); // 
    //   }
    
    //   const handleStorageChange = () => {
    //     const newToken = localStorage.getItem("accessToken");
    //     setToken(newToken);
    
    //     if (newToken) {
    //       navigate("/home", { replace: true });
    //     }
    //   };
    
    //   window.addEventListener("storage", handleStorageChange);
    //   return () => window.removeEventListener("storage", handleStorageChange);
    // }, []);

  useEffect(() => {
    const getOSInfo = async () => {
      const nav = navigator as any;
  
      if (nav.userAgentData && nav.userAgentData.getHighEntropyValues) {
        const ua = await nav.userAgentData.getHighEntropyValues(["platformVersion"]);

        // Windows 11 có platformVersion >= 13
        let osVersion = parseInt(ua.platformVersion.split(".")[0]) >= 13 ? "11" : "10";

        setDevice(`Windows ${osVersion} - Chrome ${nav.userAgentData.brands[2].version}`);

      } else {
        setDevice("Không thể xác định hệ điều hành");
      }
    };
  
    getOSInfo();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = { email, password, device };
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

        console.log("✅ Login successful, redirecting...");

        if (UserType === "admin") {
          navigate("/admin", { replace: true });
        }
        else {
          navigate("/home", { replace: true });
        }
          
        window.location.reload();
      } else {
        throw new Error("Incomplete data returned!");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundColor: "#1C1C1D" }}>
      <div className="flex-col md:flex-row w-full bg-opacity-50 p-5">
        <div className="text-7xl text-center break-words text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-300 from-sky-400 ">
            𝓛𝓲𝓷𝓴𝓤𝓹
          </span>
        </div>
        <div className="flex justify-center items-center w-full mt-10">
          <form onSubmit={handleLogin} className={`max-w-sm p-6 border rounded-2xl border-stone-800 w-full bg-opacity-75 ${isSun ? "shadow-[3px_3px_0px_rgba(100,100,100,0.3)] bg-black" : "shadow-[3px_3px_0px_rgba(10,10,10,0.5)] bg-white"}`} style={{ maxWidth: "32rem", height: "auto" }}>
            <div className="flex relative">
              <p className={`text-center font-bold block mb-2 text-2xl ${isSun ? "text-white" : "text-black"}`}>
                Đăng nhập
              </p>
              <button type="reset" className={`p-1.5 rounded-xl backdrop-blur-md hover:backdrop-blur-lg absolute right-0 transition-all ${isSun ? "bg-[#f9d134] text-black shadow-[0px_0px_30px_5px_rgba(255,255,255,0.5)] hover:shadow-[0px_0px_5px_3px_rgba(255,255,255,0.5)] duration-1000" : "bg-[#757271] text-blue-700 duration-1000"}`} onClick={() => setIsSun(!isSun)}>
                {isSun ? <Sun /> : <Moon />}
              </button>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className={`block mb-2 text-sm font-medium text-gray-900 ${isSun ? "text-white" : "text-black"}`}>Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`text-sm rounded-lg block w-full p-2.5 border focus:ring-blue-500 focus:border-blue-500 focus:bg-[#e8f0fe] ${isSun ? "bg-black border-white text-white placeholder-gray-200 focus:placeholder-gray-800 focus:text-black" : "bg-white border-black text-black placeholder-gray-800 focus:placeholder-gray-800 focus:text-black"}`}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className={`block mb-2 text-sm font-medium ${isSun ? "text-white" : "text-black"}`}>Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`text-sm rounded-lg block w-full p-2.5 border focus:ring-blue-500 focus:border-blue-500 focus:bg-[#e8f0fe] ${isSun ? "bg-black border-white text-white placeholder-gray-200 focus:placeholder-gray-800 focus:text-black" : "bg-white border-black text-black placeholder-gray-800 focus:placeholder-gray-800 focus:text-black"}`}
                placeholder="•••••••••"
                required
              />
            </div>

            <div className="w-full flex justify-between">
              <div className="flex items-start mb-5">
                <div className="flex items-center h-5">
                  <input id="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800" />
                </div>
                <label htmlFor="remember" className={`ms-2 text-sm font-medium ${isSun ? "text-white" : "text-black"}`}>Nhớ tài khoản</label>
              </div>
              <a href="/register" className="text-blue-700 hover:underline text-sm">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="mb-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Đăng nhập</button>
            {<p style={{ color: "red" }}>{error || "ㅤ"}</p>}

            <div className="flex items-center justify-center">
              <span className="h-px w-16 bg-gray-400 dark:bg-gray-600"></span>
              <span className={`mx-2.5 ${isSun ? "text-white" : "text-black"}`}>Hoặc</span>
              <span className="h-px w-16 bg-gray-400 dark:bg-gray-600"></span>
            </div>

            <div className="flex items-center justify-center mt-6">
              <button className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800" onClick={() => navigate("/register")}>
                <span className={`relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md group-hover:bg-opacity-0 ${isSun ? "bg-black text-white hover:text-black hover:bg-white" : "bg-black text-white hover:text-black hover:bg-white"}`}>Đăng ký tài khoản</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
