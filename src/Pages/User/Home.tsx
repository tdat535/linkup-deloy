import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewPost from '../../Components/Layout/Post/NewPost';
import PostList from '../../Components/Layout/Post/PostList';
import { PostProps } from '../../Components/Layout/Post/PostProps';
import axiosInstance from 'Components/TokenRefresher';

const Home: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);

  const prevIsMobile = useRef<boolean | null>(null);

  const handleResize = useCallback(() => {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== prevIsMobile.current) {
      prevIsMobile.current = newIsMobile;
      setIsMobile(newIsMobile);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("currentUserId");
      if (!token || !userId) return;

      const response = await axiosInstance.get(
        `https://api-linkup.id.vn/api/media/getPost?${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const postData = Array.isArray(response.data)
        ? response.data
        : response.data.data;

      if (Array.isArray(postData)) {
        const formattedPosts: PostProps[] = postData.map((post: any) => ({
          id: post.id || Math.random().toString(),
          avatar:
            post.User.avatar ||
            "https://media.tenor.com/9vTAoKqOXPQAAAAM/shrek-shrek-meme.gif",
          name: post.User.username || "Người dùng",
          time: post.createdAt
            ? new String(post.createdAt).split(".")[0].split("T")[1] +
              " " +
              new String(post.createdAt)
                .split(".")[0]
                .split("T")[0]
                .split("-")
                .reverse()
                .join("-")
            : "Vừa xong",
          caption: post.content || "Không có nội dung",
          image: post.mediaUrl || null,
        }));
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error("Lỗi khi lấy bài viết:", err);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (isMobile === null) return null;
  return (
    <div className={isMobile ? 'mt-20 pl-4 pr-4 pb-15 '  : ' '}>
      <NewPost refreshPosts={fetchPosts} />
      <PostList posts={posts} />
      </div>
  );
};


export default Home;
