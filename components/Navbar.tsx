"use client";

import Link from "next/link";
// Đảm bảo import List và History cho các đường dẫn mới
import { Search, ShoppingCart, User, LogOut, ChevronDown, UserCog, Package, Tags, List, History } from 'lucide-react'; 
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth"; 

// Định nghĩa các hằng số Vai trò (Để đồng bộ với backend)
const USER_ROLE = 'ROLE_USER';
const ADMIN_ROLE = 'ROLE_ADMIN';

export default function Navbar() {
  // Trạng thái xác thực từ hook
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter(); 

  const handleLogout = () => {
    // 1. Xóa token
    localStorage.removeItem('auth_token');
    setIsMenuOpen(false);
    console.log("Đăng xuất thành công.");
    
    // 2. Chuyển hướng cứng về trang chủ hoặc trang đăng nhập
    router.push('/'); 
  };

  const handleAccountClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };
  
  const accountLink = '/auth'; 

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo/Brand Name */}
        <Link href="/" className="text-3xl font-extrabold text-indigo-600 hover:text-indigo-700 transition">
          TECHZONE
        </Link>
        
        {/* Search Bar (Trung tâm) */}
        <div className="hidden lg:flex flex-grow max-w-xl mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, laptop, PC..."
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Icons/Links (Phải) */}
        <div className="flex items-center space-x-6">
          <Link href="/products" className="text-gray-600 hover:text-indigo-600 transition hidden sm:inline">
            Sản phẩm
          </Link>
          
          <Link href="/cart" className="text-gray-600 hover:text-indigo-600 transition relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              0
            </span>
          </Link>
          
          {/* Conditional User/Auth Icon */}
          {isLoading ? (
            // 1. LOADING
            <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full"></div>
          ) : isLoggedIn ? (
            // 2. ĐÃ ĐĂNG NHẬP: Hiển thị icon và Dropdown Menu
            <div className="relative">
              <button 
                onClick={handleAccountClick}
                className="flex items-center text-gray-600 hover:text-indigo-600 transition focus:outline-none"
                aria-expanded={isMenuOpen}
              >
                <User className="h-6 w-6" />
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
              </button>
              
              {isMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200" 
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  {isAdmin && (
                    <>
                    {/* Link Quản lý Sản phẩm */}
                    <Link 
                        href="/admin/manager-product" 
                        className="flex items-center px-4 py-2 text-sm text-pink-700 font-semibold hover:bg-pink-50 hover:text-pink-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <List className="h-4 w-4 mr-2" /> Quản lý SP
                      </Link>
                    {/* Link Thêm Sản phẩm */}
                    <Link 
                        href="/admin/add-product" 
                        className="flex items-center px-4 py-2 text-sm text-pink-700 font-semibold hover:bg-pink-50 hover:text-pink-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="h-4 w-4 mr-2" /> Thêm sản phẩm
                      </Link>
                    {/* Link Quản lý Danh mục */}
                    <Link 
                        href="/admin/manager-category" 
                        className="flex items-center px-4 py-2 text-sm text-pink-700 font-semibold hover:bg-pink-50 hover:text-pink-600 border-b border-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Tags className="h-4 w-4 mr-2" /> Quản lý danh mục
                      </Link>
                      </>
                  )}
                  
                  {/* Hồ sơ cá nhân */}
                  <Link 
                    href="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" /> Hồ sơ của tôi
                  </Link>

                  {/* Lịch sử Đơn hàng */}
                  <Link 
                    href="/orders" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <History className="h-4 w-4 mr-2" /> Đơn hàng
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Đăng xuất */}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 3. CHƯA ĐĂNG NHẬP: Hiển thị Link chuyển hướng
            <Link href={accountLink} className="text-gray-600 hover:text-indigo-600 transition" title="Đăng nhập / Đăng ký">
              <User className="h-6 w-6" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}