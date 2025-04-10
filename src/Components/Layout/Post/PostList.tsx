import React from "react";
import { PostProps } from "./PostProps";
import PostItem from "./PostItems";

const PostList: React.FC<{ posts: PostProps[] }> = ({ posts }) => {
  return (
    <div>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500">Không có bài viết nào.</p>
      ) : (
        posts.map((post) => <PostItem key={post.id} post={post} />)
      )}
    </div>
  );
};

export default PostList;
