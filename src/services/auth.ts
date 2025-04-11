// src/services/auth.ts
import axios from 'axios';
import axiosInstance from '../Components/TokenRefresher';

const API_URL = 'https://api-linkup.id.vn/api';

// Function to decode JWT token and extract expiration time
export const getTokenExpiration = (token: string): number | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    return exp ? exp * 1000 : null; // Convert to milliseconds
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Check if token expires within the next 5 minutes
export const isTokenExpiringSoon = (token: string): boolean => {
  const expTime = getTokenExpiration(token);
  if (!expTime) return true;
  
  // If token expires in less than 5 minutes, consider it expiring soon
  const fiveMinutesInMs = 5 * 60 * 1000;
  return Date.now() + fiveMinutesInMs >= expTime;
};

// Function to refresh the token
export const refreshToken = async (): Promise<boolean> => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.log('No refresh token available');
    return false;
  }
  
  try {
    console.log('Attempting to refresh token...');
    const response = await axios.post(`${API_URL}/auth/refresh`, 
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('Refresh response:', response.data);
    
    if (response.data && response.data.AccessToken) {
      localStorage.setItem('accessToken', response.data.AccessToken);
      
      if (response.data.RefreshToken) {
        localStorage.setItem('refreshToken', response.data.RefreshToken);
      }
      
      console.log('Token refreshed successfully');
      return true;
    }
    
    console.log('Token refresh failed - invalid response');
    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post('https://api-linkup.id.vn/api/auth/logout', null, {
      withCredentials: true, // 👈 để gửi cookie
    });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');

    window.location.href = '/login';
  } catch (error) {
    console.error("Logout failed", error);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
    window.location.href = '/login';
  }
};

export default {
  getTokenExpiration,
  isTokenExpiringSoon,
  refreshToken,
  logout
};