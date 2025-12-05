import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Đã xóa 'unoptimized: true' để BẬT lại tính năng tối ưu hóa hình ảnh.
    
    // Giữ lại remotePatterns để cho phép Next.js tối ưu hóa hình ảnh 
    // từ các tên miền bên ngoài này.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', 
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', 
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;