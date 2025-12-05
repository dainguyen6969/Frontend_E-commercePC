"use client";

import React from 'react';

// Component Footer đơn giản để hoàn thiện layout
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-10">
      <div className="container mx-auto p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-lg font-bold mb-4">TECHZONE</h4>
          <p className="text-sm text-gray-400">
            Cung cấp các sản phẩm PC Gaming, Laptop, và Linh kiện cao cấp.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4">HỖ TRỢ</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-indigo-400 transition">Trung tâm trợ giúp</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition">Chính sách bảo hành</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition">Điều khoản dịch vụ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4">DANH MỤC</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-indigo-400 transition">PC Gaming</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition">Laptop</a></li>
            <li><a href="#" className="hover:text-indigo-400 transition">Linh kiện</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4">LIÊN HỆ</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Email: info@techzone.vn</li>
            <li>Điện thoại: 090-XXX-XXXX</li>
            <li>Địa chỉ: TP. Hồ Chí Minh, Việt Nam</li>
          </ul>
        </div>
      </div>
      <div className="bg-gray-900 p-4 text-center text-sm text-gray-500 border-t border-gray-700">
        &copy; {new Date().getFullYear()} TechZone. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;