"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import { apiService, Category } from '@/services/api';
import { PlusCircle, Loader2, Image as ImageIcon, CheckCircle, Upload, XCircle, Package, Tags } from 'lucide-react';

const ADMIN_ROLE = 'ROLE_ADMIN';

// --- Component Chính: Add Product Page (Đã sửa cú pháp export) ---

export default function AddProductPage() { // SỬ DỤNG CÚ PHÁP FUNCTION CHO EXPORT DEFAULT
  // Lấy trạng thái Auth từ hook
  const { isAdmin, isLoading: loadingAuth, isLoggedIn } = useAuth();
  const router = useRouter();
  
  // States cho Form
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | string>('');
  const [productImage, setProductImage] = useState<File | null>(null); // File ảnh được chọn
  const [productImageUrl, setProductImageUrl] = useState<string>(''); // URL ảnh công khai (từ Backend sau khi upload)
  
  // States chung
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Fetch Categories ---
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
        const list = await apiService.getAllCategories();
        setCategories(list);
        if (list.length > 0) {
            setSelectedCategory(list[0].id); // Chọn danh mục đầu tiên làm mặc định
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
    } finally {
        setLoadingCategories(false);
    }
  }, []);

  // --- Phân quyền và Tải dữ liệu ---
  useEffect(() => {
    if (!loadingAuth) {
        if (!isLoggedIn) {
             router.push('/auth?redirect=/admin/add-product');
        } else if (!isAdmin) {
             router.push('/');
        } else {
             fetchCategories();
        }
    }
  }, [loadingAuth, isLoggedIn, isAdmin, router, fetchCategories]);

  // --- Xử lý Chọn File ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type.startsWith('image/')) {
            setProductImage(file);
            // Tạo preview local (tạm thời)
            if (productImageUrl) {
              URL.revokeObjectURL(productImageUrl); // Giải phóng URL cũ nếu có
            }
            setProductImageUrl(URL.createObjectURL(file)); 
            setMessage(null);
        } else {
            setProductImage(null);
            setMessage({ type: 'error', text: 'Vui lòng chọn một file ảnh hợp lệ.' });
        }
    }
  };

  // --- LOGIC XỬ LÝ UPLOAD QUA BACKEND ---
  const uploadImage = async (file: File): Promise<string> => {
      setMessage({ type: 'success', text: 'Đang upload ảnh lên Server...' });
      try {
          // Hàm này gọi POST /files/upload
          const publicUrl = await apiService.uploadImageViaBackend(file);
          setMessage({ type: 'success', text: 'Upload ảnh thành công! Đang gửi dữ liệu sản phẩm.' });
          return publicUrl;
      } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Lỗi không xác định khi upload ảnh.");
      }
  }


  // --- HÀM XỬ LÝ SUBMIT CHÍNH (UPLOAD + CREATE PRODUCT) ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return; 

    setIsSubmitting(true);
    setMessage(null);
    let finalImageUrl = '';

    try {
        // Validation Front-end
        if (!productName.trim() || !price || !selectedCategory) {
            throw new Error("Vui lòng điền đầy đủ Tên, Giá và Danh mục.");
        }
        if (Number(price) <= 0) {
            throw new Error("Giá sản phẩm phải lớn hơn 0.");
        }
        if (!productImage) {
            throw new Error("Vui lòng chọn ảnh sản phẩm.");
        }

        // --- 1. UPLOAD ẢNH (Tuần tự) ---
        finalImageUrl = await uploadImage(productImage);

        // --- 2. GỬI DỮ LIỆU SẢN PHẨM ---
        const productData = {
            ten: productName.trim(),
            gia: Number(price),
            anh: finalImageUrl, // Gửi URL ảnh đã lưu
            danhMucId: Number(selectedCategory),
        };

        const response = await apiService.createProduct(productData);

        if (response && response.code === 1000) {
            setMessage({ type: 'success', text: `Thêm sản phẩm '${productName}' thành công! Vui lòng làm mới trang để kiểm tra.` });
            // Reset form sau thành công
            setProductName('');
            setPrice('');
            setProductImage(null);
            setProductImageUrl('');
            setSelectedCategory(categories.length > 0 ? categories[0].id : '');
        } else {
            setMessage({ type: 'error', text: response?.message || 'Lỗi Backend khi thêm sản phẩm.' });
        }
    } catch (err) {
        // Bắt lỗi toàn cục
        console.error("Final submission error:", err);
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Lỗi không xác định.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Render UI ---
  if (loadingAuth || (!loadingAuth && !isLoggedIn) || (!loadingAuth && !isAdmin)) {
    return (
        <div className="container mx-auto p-8 text-center text-gray-500">
          {loadingAuth ? "Đang kiểm tra quyền truy cập..." : "Lỗi: Bạn không có quyền truy cập (Yêu cầu ADMIN)."}
        </div>
      );
  }

  // Nếu là ADMIN, hiển thị Form
  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center">
        <PlusCircle className="h-7 w-7 mr-3" />
        Quản Lý Sản Phẩm - Thêm Sản Phẩm Mới
      </h1>

      <p className="mb-6 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        **LƯU Ý:** Chức năng upload ảnh hiện đang sử dụng API `/files/upload` giả định. 
        Bạn cần triển khai endpoint này trong Backend Spring Boot để lưu file vào Local Disk và trả về URL public (ví dụ: `/static/filename`).
      </p>

      {/* Message Box */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg shadow-md flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400'}`}>
          {message.type === 'error' ? <XCircle className="h-5 w-5 mr-3" /> : <CheckCircle className="h-5 w-5 mr-3" />}
          {message.text}
        </div>
      )}

      {/* Form Thêm Sản phẩm */}
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cột 1: Thông tin cơ bản */}
            <div className="space-y-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">Tên Sản phẩm</label>
                  <input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="PC Gaming RTX 4070"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</label>
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="35000000"
                    required
                    min="1"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-sm text-gray-700 mb-2">Danh mục</label>
                  {loadingCategories ? (
                    <div className="w-full p-3 bg-gray-100 rounded-lg animate-pulse">Đang tải...</div>
                  ) : (
                    <select
                      id="category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                      required
                      disabled={isSubmitting || categories.length === 0}
                    >
                        {categories.length === 0 ? (
                             <option value="" disabled>Chưa có danh mục nào</option>
                        ) : (
                            categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.ten}</option>
                            ))
                        )}
                    </select>
                  )}
                </div>
            </div>

            {/* Cột 2: Upload Ảnh */}
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh Sản phẩm</label>
                    <div className="flex items-center justify-center w-full">
                        <label 
                            htmlFor="file-upload" 
                            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition ${productImage || productImageUrl ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {/* Hiển thị trạng thái preview/đã chọn */}
                                {productImageUrl && !productImage ? (
                                     // Trường hợp ảnh đã được lưu và có URL công khai (dùng cho edit)
                                    <div className="text-center text-green-600">
                                        <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                                        <p className="text-xs">Ảnh đã được upload và lưu trữ.</p>
                                        <img 
                                            src={productImageUrl} 
                                            alt="Preview" 
                                            className="mt-2 h-16 w-auto object-contain rounded-md mx-auto shadow"
                                        />
                                    </div>
                                ) : productImage ? (
                                    <div className="text-center text-indigo-600">
                                        <Upload className="h-6 w-6 mx-auto mb-2" />
                                        <p className="text-sm font-medium">Đã chọn: {productImage.name}</p>
                                        <p className="text-xs text-gray-500">Nhấn Thêm Sản phẩm để upload và lưu.</p>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                        <p className="mb-2 text-sm">Nhấp để chọn ảnh</p>
                                        <p className="text-xs">PNG, JPG, GIF</p>
                                    </div>
                                )}
                            </div>
                            <input 
                                id="file-upload" 
                                type="file" 
                                className="hidden" 
                                onChange={handleFileChange} 
                                accept="image/*"
                                disabled={isSubmitting}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:bg-indigo-400 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Đang xử lý...
            </>
          ) : (
            <>
              <PlusCircle className="h-5 w-5 mr-2" /> Thêm Sản phẩm
            </>
          )}
        </button>
      </form>
    </div>
  );
}
