// Code for Post component
// This component is used to display a post
// It contains the avatar of the user who posted, the post image, and the like and comment buttons
import React from "react";

const Post = () => (
  <div className="bg-[#080A0B] text-white shadow-md p-4 border-b border-gray-400">
    <div className="flex items-center mb-4">
      <img src="https://media.tenor.com/9vTAoKqOXPQAAAAM/shrek-shrek-meme.gif" alt="Avatar" className="w-10 h-10 rounded-full mr-2 object-cover" />
      <div>
        <span className="font-bold">Shrek Harvey</span>
        <span className="text-gray-500 text-sm ml-2">2 giờ trước</span>
      </div>
    </div>
    <div className="mb-4">
      <p className="text-gray-300">Caption của bài post sẽ hiển thị ở đây...</p>
    </div>
    <div className="mb-4">
      <img src="https://cdn.pixabay.com/photo/2018/05/13/20/21/lake-3397784_1280.jpg" alt="Post" className="w-full max-h-96 rounded-2xl object-contain" />
    </div>
    <div className="flex gap-5 text-gray-400">
      <svg className="w-6 h-6 hover:text-white cursor-pointer dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z" />
      </svg>

      <svg className="w-6 h-6 hover:text-white cursor-pointer dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 9h5m3 0h2M7 12h2m3 0h5M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.616a1 1 0 0 0-.67.257l-2.88 2.592A.5.5 0 0 1 8 18.477V17a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      </svg>

      <svg className="w-6 h-6 hover:text-white cursor-pointer dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="m15.141 6 5.518 4.95a1.05 1.05 0 0 1 0 1.549l-5.612 5.088m-6.154-3.214v1.615a.95.95 0 0 0 1.525.845l5.108-4.251a1.1 1.1 0 0 0 0-1.646l-5.108-4.251a.95.95 0 0 0-1.525.846v1.7c-3.312 0-6 2.979-6 6.654v1.329a.7.7 0 0 0 1.344.353 5.174 5.174 0 0 1 4.652-3.191l.004-.003Z" />
      </svg>
    </div>

  </div>
);

export default Post;