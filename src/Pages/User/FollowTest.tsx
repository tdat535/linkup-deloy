// src/components/FollowTest.tsx

import React, { useState } from 'react';
import axiosInstance from '../../Components/TokenRefresher';

interface FollowTestProps {
  accessToken: string;
}

const FollowTest: React.FC<FollowTestProps> = ({ accessToken }) => {
  const [followerId, setFollowerId] = useState<string>('');
  const [followingId, setFollowingId] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const createFollow = async () => {
    if (!followerId || !followingId) {
      setResult('Vui lòng nhập đầy đủ ID người follow và người được follow');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        'https://api-linkup.id.vn/api/follow/createFollow',
        {
          followerId,
          followingId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      setResult(`Tạo follow thành công: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('Error creating follow:', error);
      setResult(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const acceptFollow = async () => {
    if (!followerId || !followingId) {
      setResult('Vui lòng nhập đầy đủ ID người follow và người được follow');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        'https://api-linkup.id.vn/api/follow/acceptedFollow',
        {
          followerId,
          followingId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      setResult(`Chấp nhận follow thành công: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('Error accepting follow:', error);
      setResult(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Test API Follow</h2>
      
      <div className="mb-4">
        <label className="block mb-1">ID người follow:</label>
        <input
          type="text"
          value={followerId}
          onChange={(e) => setFollowerId(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Nhập ID người follow"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">ID người được follow:</label>
        <input
          type="text"
          value={followingId}
          onChange={(e) => setFollowingId(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Nhập ID người được follow"
        />
      </div>
      
      <div className="flex space-x-4 mb-4">
        <button
          onClick={createFollow}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Tạo Follow'}
        </button>
        
        <button
          onClick={acceptFollow}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Chấp Nhận Follow'}
        </button>
      </div>
      
      {result && (
        <div className="p-3 bg-gray-100 rounded">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default FollowTest;