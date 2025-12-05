"use client";

import React, { useState } from 'react';

// Giả định: Next.js App sử dụng Tailwind CSS
const API_BASE_URL = 'http://localhost:8080';

// Component dùng chung cho nút đăng nhập/ký bằng Google
// LƯU Ý: Logic này là MOCK. Cần tích hợp thư viện Google OAuth thực tế.
const GoogleAuthButton = ({ isSignup }) => {
  const [loading, setLoading] = useState(false);
  
  const handleGoogleAuth = async () => {
    setLoading(true);
    
    // MOCK: Giả lập quá trình chuyển hướng và nhận token
    const endpoint = isSignup ? 'google-signup' : 'google-login';
    console.log(`Bắt đầu xác thực Google... Gửi yêu cầu đến ${API_BASE_URL}/${endpoint}`);
    
    // Trong môi trường thực tế, bạn sẽ nhận được một Google ID Token
    const MOCK_TOKEN = "MOCK_GOOGLE_ID_TOKEN_12345"; 

    try {
        // Giả lập cuộc gọi API gửi token về backend
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: MOCK_TOKEN }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('auth_token', data.token); 
            // KHÔNG dùng alert() trong môi trường iframe, dùng console.log/custom UI thay thế
            console.log(`Đăng nhập Google thành công! Token: ${data.token}`);
            // alert(`Đăng nhập Google thành công! Đang chuyển hướng...`); 
        } else {
             // KHÔNG dùng alert() trong môi trường iframe
            console.error(data.message || 'Xác thực Google thất bại.');
            // alert(data.message || 'Xác thực Google thất bại.');
        }

    } catch (error) {
        console.error('Lỗi kết nối Google API/Backend:', error);
        // KHÔNG dùng alert() trong môi trường iframe
        // alert('Lỗi kết nối. Vui lòng kiểm tra cấu hình Google OAuth và CORS.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleAuth}
      disabled={loading}
      className="w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-50 transition duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
    >
      {/* Icon Google SVG */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
        <path fill="#FFC107" d="M43.61 20.087c0-.795-.072-1.564-.195-2.327H24v4.391h10.942c-.495 2.56-2.094 4.757-4.507 6.224v.006l.006.006l3.784 2.957c2.277-2.109 3.593-5.181 3.593-8.875z"></path>
        <path fill="#FF3D00" d="M24 43.61c5.158 0 9.77-1.722 13.029-4.707l-3.784-2.957c-2.075 1.39-4.75 2.208-7.245 2.208-5.748 0-10.686-3.874-12.454-9.043H7.072v3.181C10.375 40.38 16.634 43.61 24 43.61z"></path>
        <path fill="#4CAF50" d="M11.545 30.036c-.958-2.857-.958-5.894 0-8.751V18.104H7.072a19.262 19.262 0 000 11.892l4.473-.004z"></path>
        <path fill="#1976D2" d="M24 10.39c3.275 0 6.233 1.137 8.52 3.328l3.056-2.923C32.775 6.74 28.71 4.39 24 4.39c-7.366 0-13.625 3.23-16.928 7.971l4.473 3.181C13.314 14.264 18.252 10.39 24 10.39z"></path>
      </svg>
      {loading ? 'Đang tải...' : isSignup ? 'Đăng ký bằng Google' : 'Đăng nhập bằng Google'}
    </button>
  );
};

// Component Form Đăng Ký
const SignupForm = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // 1. THÊM STATE CHO NHẬP LẠI MẬT KHẨU
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // 3. LOGIC KIỂM TRA MẬT KHẨU CÓ KHỚP HAY KHÔNG
    if (password !== confirmPassword) {
      setMessage('Lỗi: Mật khẩu và Nhập lại mật khẩu không khớp.');
      return; // Dừng việc gửi API nếu không khớp
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/trongdai/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Chỉ gửi username và password lên server
        body: JSON.stringify({ username, password }), 
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => onSwitch('login'), 2000);
      } else {
        setMessage(data.message || 'Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.');
      }
    } catch (error) {
      console.error('Lỗi mạng hoặc server:', error);
      setMessage('Lỗi kết nối. Vui lòng kiểm tra API URL và cấu hình CORS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl w-full max-w-sm">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Đăng Ký</h2>
      
      <GoogleAuthButton isSignup={true} />
      
      <div className="relative flex items-center justify-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">HOẶC</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-username">Tên đăng nhập</label>
          <input
            id="signup-username"
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="Tên đăng nhập của bạn"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="signup-password">Mật khẩu</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="********"
            required
          />
        </div>
        {/* 2. THÊM TRƯỜNG NHẬP LẠI MẬT KHẨU */}
        <div> 
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-password">Nhập lại mật khẩu</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="********"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Ký Tài Khoản'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      <p className="mt-4 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <button
          onClick={() => onSwitch('login')}
          className="text-indigo-600 font-medium hover:text-indigo-500"
          type="button"
        >
          Đăng nhập ngay
        </button>
      </p>
    </div>
  );
};

// Component Form Đăng Nhập
const LoginForm = ({ onSwitch }) => {
  const [username, setUsername] = useState(''); // Tên đăng nhập
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/trongdai/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Gửi username
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token); 
        setMessage('Đăng nhập thành công! Đang chuyển hướng...');
        // Thường thì sau đó sẽ chuyển hướng người dùng đến Dashboard
      } else {
        setMessage(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
      }
    } catch (error) {
      console.error('Lỗi mạng hoặc server:', error);
      setMessage('Lỗi kết nối. Vui lòng kiểm tra API URL và cấu hình CORS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl w-full max-w-sm">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Đăng Nhập</h2>

      {/* Nút Đăng nhập bằng Google */}
      <GoogleAuthButton isSignup={false} />

      <div className="relative flex items-center justify-center my-6">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">HOẶC</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-username">Tên đăng nhập</label>
          <input
            id="login-username"
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="Tên đăng nhập của bạn"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="login-password">Mật khẩu</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="********"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
      <p className="mt-4 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <button
          onClick={() => onSwitch('signup')}
          className="text-indigo-600 font-medium hover:text-indigo-500"
          type="button"
        >
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
};

// Component chính
const App = () => {
  // state để chuyển đổi giữa hai form: 'login' hoặc 'signup'
  const [currentView, setCurrentView] = useState('login'); 

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Ứng Dụng Xác Thực</h1>
      {currentView === 'login' ? (
        <LoginForm onSwitch={setCurrentView} />
      ) : (
        <SignupForm onSwitch={setCurrentView} />
      )}
      
      {/* Footer cho môi trường phát triển */}
      <div className="mt-12 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg max-w-lg shadow-inner">
        <p className="font-bold">LƯU Ý QUAN TRỌNG VỀ API & GOOGLE OAUTH:</p>
        <p className="text-sm">Hiện tại, ứng dụng này đang cố gắng gửi yêu cầu đến <code>{API_BASE_URL}</code>. Để ứng dụng hoạt động, bạn cần:</p>
        <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
            <li>Thiết lập API Backend để xử lý các endpoint <code>/login</code>, <code>/signup</code>.</li>
            <li>**Đối với Google:** Thiết lập Backend để nhận và xác thực **Google ID Token** từ frontend.</li>
            <li>Cấu hình CORS trên Server Backend để cho phép domain của Next.js gửi yêu cầu.</li>
        </ol>
      </div>
    </div>
  );
};

export default App;