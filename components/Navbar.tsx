"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from 'lucide-react'; // Sử dụng Lucide Icons

export default function Navbar() {
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
          <Link href="/auth/login" className="text-gray-600 hover:text-indigo-600 transition">
            <User className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}