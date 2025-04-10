import { useEffect, lazy, Suspense } from 'react';
import { Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import UserLayout from '../Components/UserLayout';
import UsersPage from '../Pages/Dashboard/UserPage';
import DashboardPage from '../Pages/Dashboard/DashboardPage';
import AdminLayout from '../Components/AdminLayout';
import PostsPage from '../Pages/Dashboard/PostsPage';
import ErrorPage from '../Pages/ErrorPage';
import FeatureDevelopingPage from '../Pages/FeatureDevelopingPage';
import CommentPage from '../Pages/Dashboard/CommentPage';
import ReportPage from '../Pages/Dashboard/ReportPage';

import "react-toastify/dist/ReactToastify.css";
import React from 'react';

const Home = lazy(() => import('../Pages/User/Home'));
const Explore = lazy(() => import('../Pages/User/Explore'));
const Messages = lazy(() => import('../Pages/User/Messages'));
const Notifications = lazy(() => import('../Pages/User/Notifications'));
const Profile = lazy(() => import('../Pages/User/Profile'));
const Login = lazy(() => import('../Pages/Auth/Login'));
const Register = lazy(() => import('../Pages/Auth/Register'));
const FollowTest = lazy(() => import('../Pages/User/FollowTest'));


// import Home from '../pages/user/Home';
// import Explore from './pages/user/Explore';
// import Messages from './pages/user/Messages';
// import Notifications from './pages/user/Notifications';
// import Profile from './pages/user/Profile';
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
// import FollowTest from './pages/user/FollowTest';
// import TokenRefresher from './components/TokenRefresher';
// import { ThemeProvider } from "./context/ThemeContext";


const AppRoutes = ({token}: { token: string | null }) => {
 
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const role = JSON.parse(localStorage.getItem("user") || "{}")?.userType;
  
    if (role !== "admin" && location.pathname.includes("/admin")) {
      navigate("/home", { replace: true }); // Chuyển trang ngay lập tức, không lưu lịch sử
      alert("Bạn không có quyền truy cập trang admin!");
    }
    
  }, [location.pathname, navigate]);
  
  return (
      <>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            {token ? (
                <>
                    <Route path="/home" element={<UserLayout />}>
                        <Route index element={<Home />} />
                        <Route path="search" element={<Explore />} />
                        <Route path="messages" element={<Messages />} />
                        <Route path="notifications" element={<Notifications />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="follow-test" element={<FollowTest accessToken={token} />} />
                        <Route path="users" element={<UsersPage />} />
                    </Route>

                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="users-list" element={<UsersPage />} />
                        <Route path="posts-list" element={<PostsPage />} />
                        <Route path="comments-list" element={<CommentPage/>} />
                        <Route path="report-list" element={<ReportPage/>} />
                    </Route>

                    <Route path='*' element={<ErrorPage />} />
                    <Route path="/developing" element={<FeatureDevelopingPage />} />
                </>
            ) : (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}
          </Routes>
        </Suspense>
      </>
  );
};

export default AppRoutes;