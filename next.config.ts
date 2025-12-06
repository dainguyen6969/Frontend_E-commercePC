import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
      // THÊM CẤU HÌNH CHO LOCAL BACKEND (PORT 8080)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/trongdai/static/**', // Đảm bảo khớp context path và thư mục static
      }
    ],
  },
};

export default nextConfig;