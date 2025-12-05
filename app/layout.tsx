import './globals.css'; // Đảm bảo import globals.css
import React from 'react';

// Import các component Navbar và Footer (đã là default export)
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Định nghĩa props cho RootLayout
interface RootLayoutProps {
  children: React.ReactNode; 
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">
            {children} 
        </main>
        <Footer />
      </body>
    </html>
  );
}