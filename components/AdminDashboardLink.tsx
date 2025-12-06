"use client";

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; 
import React from 'react';

const AdminDashboardLink: React.FC = () => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    // Hiển thị trạng thái tải nhẹ
    return <div className="mb-6 h-12 bg-gray-100 animate-pulse rounded-xl"></div>; 
  }

  if (!isAdmin) {
    // Chỉ hiển thị nếu là Admin
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-md flex justify-between items-center transition duration-300 hover:bg-red-100">
      <p className="text-red-700 font-semibold flex items-center">
        <Settings className="h-5 w-5 mr-3" />
        Bạn đang ở chế độ Quản trị (ADMIN).
      </p>
      <Link 
        href="/admin/add-product" // Giả định đây là trang Admin đầu tiên
        className="text-white bg-red-600 py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition"
      >
        Vào trang quản trị
      </Link>
    </div>
  );
};

export default AdminDashboardLink;