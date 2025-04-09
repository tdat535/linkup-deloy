import React, { useState } from 'react';

interface FollowButtonProps {
  followerId: string; // ID của người theo dõi
  followingId: string; // ID của người được theo dõi
  initialFollowState?: boolean; // Trạng thái follow ban đầu
  onFollowSuccess?: (isFollowed: boolean) => void; // Callback khi follow/unfollow thành công
}

const Follow_Button: React.FC<FollowButtonProps> = ({ 
    followerId, 
    followingId, 
    initialFollowState = false, 
    onFollowSuccess 
}) => {
    // Trạng thái follow
    const [isFollowing, setIsFollowing] = useState<boolean>(initialFollowState);

    // Trạng thái loading
    const [isLoading, setIsLoading] = useState<boolean>(false);

    //  Trạng thái lỗi (nếu có)
    const [error, setError] = useState<string | null>(null);

    /**
     * Hàm xử lý follow/unfollow khi click vào nút
     * Gửi request đến API để follow hoặc unfollow người dùng
     */

    const handleFollowToggle = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch('https://api-linkup.id.vn/api/follow/createFollow', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: followerId,
              targetId: followingId,
              action: isFollowing ? 'unfollow' : 'follow',
            }),
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update follow status');
          }
    
          const newFollowState = !isFollowing;
          setIsFollowing(newFollowState);
          
          // Call the callback if provided
          if (onFollowSuccess) {
            onFollowSuccess(newFollowState);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Follow error:', err);
        } finally {
          setIsLoading(false);
        }
      };

    return (
        <div className="follow-button-container">
      <button
        onClick={handleFollowToggle}
        disabled={isLoading}
        className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
          isFollowing
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing
          </span>
        ) : isFollowing ? (
          'Following'
        ) : (
          'Follow'
        )}
      </button>
      
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
    );
}

export default Follow_Button;