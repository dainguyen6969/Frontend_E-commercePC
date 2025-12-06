"use client";

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

// Định nghĩa các hằng số Vai trò (để đảm bảo đồng nhất)
const ADMIN_ROLE = 'ROLE_ADMIN'; // Chú ý: Backend của bạn trả về ROLE_ADMIN (có ROLE_)
const USER_ROLE = 'ROLE_USER';

interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  userRole: string | null;
  isLoading: boolean;
  // Bạn có thể thêm các thông tin khác như username, email sau này
}

/**
 * Custom hook để quản lý trạng thái xác thực và phân quyền của người dùng.
 * Hook này gọi API Introspect để xác định vai trò của người dùng.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    isAdmin: false,
    userRole: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setState({ isLoggedIn: false, isAdmin: false, userRole: null, isLoading: false });
      return;
    }

    const checkAuth = async () => {
      try {
        const profile = await apiService.introspectToken(token);
        
        if (profile && profile.isValid && profile.roles.length > 0) {
          // Lấy vai trò cao nhất: Nếu có ADMIN, chọn ADMIN, ngược lại chọn USER (có ROLE_ prefix)
          const role = profile.roles.includes(ADMIN_ROLE) ? ADMIN_ROLE : USER_ROLE;
          
          setState({
            isLoggedIn: true,
            isAdmin: profile.roles.includes(ADMIN_ROLE),
            userRole: role,
            isLoading: false,
          });
        } else {
          // Token không hợp lệ, xóa token cũ
          localStorage.removeItem('auth_token');
          setState({ isLoggedIn: false, isAdmin: false, userRole: null, isLoading: false });
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem('auth_token');
        setState({ isLoggedIn: false, isAdmin: false, userRole: null, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  return state;
}