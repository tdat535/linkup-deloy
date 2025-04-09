import React, { useState, useEffect, useCallback, useRef } from 'react';
import NewPost from '../../Components/Layout/Post/NewPost';
import PostList from '../../Components/Layout/Post/PostList';

const Home: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const prevIsMobile = useRef<boolean | null>(null);

  const handleResize = useCallback(() => {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== prevIsMobile.current) {
      prevIsMobile.current = newIsMobile;
      setIsMobile(newIsMobile);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  if (isMobile === null) return null;
  return (
    <div className={isMobile ? 'mt-20 pl-4 pr-4 pb-15 '  : ' '}>
      <NewPost />
      <PostList />
    </div>
  );
};

export default Home;
