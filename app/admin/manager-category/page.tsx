"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, FormEvent, ChangeEvent, useCallback } from 'react';
import { apiService, Category } from '@/services/api'; 
import { PlusCircle, Loader2, List, Trash2, XCircle, Tags } from 'lucide-react';

const ADMIN_ROLE = 'ROLE_ADMIN';

// --- Components Con ---

interface CategoryListProps {
    categories: Category[];
    onDelete: (id: number) => void;
    isDeleting: boolean;
    deletingId: number | null;
    isLoading: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({ categories, onDelete, isDeleting, deletingId, isLoading }) => {
    
    if (isLoading) {
         return (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Đang tải danh mục...
            </div>
        );
    }
    
    if (categories.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-md">
                Chưa có danh mục nào. Hãy thêm một danh mục mới!
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {categories.map((cat) => (
                    <li key={cat.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition">
                        <div className="flex-grow">
                            <p className="text-lg font-semibold text-gray-800">{cat.ten}</p>
                            <p className="text-sm text-gray-500">{cat.moTa || 'Không có mô tả'}</p>
                        </div>
                        <button
                            onClick={() => {
                                // Validate: Yêu cầu xác nhận trước khi xóa (Sử dụng window.confirm thay vì alert)
                                if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục '${cat.ten}' (ID: ${cat.id})? Hành động này không thể hoàn tác.`)) {
                                    onDelete(cat.id);
                                }
                            }}
                            disabled={isDeleting}
                            className={`p-2 rounded-full transition ${deletingId === cat.id ? 'bg-red-400' : 'bg-red-50 hover:bg-red-200'} text-red-600 disabled:opacity-50`}
                            title="Xóa danh mục"
                        >
                            {deletingId === cat.id && isDeleting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Trash2 className="h-5 w-5" />
                            )}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};


// --- Component Chính (Category Management Page) ---

const ManageCategoryPage: React.FC = () => {
  const { isAdmin, isLoading: loadingAuth, isLoggedIn, userRole } = useAuth();
  const router = useRouter();
  
  // State cho Form Thêm
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State cho Danh sách và Xóa
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Hàm Fetch Danh sách (Sử dụng useCallback để tránh tạo lại hàm)
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
        const list = await apiService.getAllCategories();
        setCategories(list);
    } catch (error) {
        console.error("Lỗi tải danh mục:", error);
        setMessage({ type: 'error', text: 'Không thể tải danh mục. Vui lòng kiểm tra Backend.' });
    } finally {
        setLoadingCategories(false);
    }
  }, []);

  // --- Logic Kiểm tra và Chuyển hướng Phân quyền ---
  useEffect(() => {
    if (!loadingAuth) {
      if (!isLoggedIn) {
          router.push('/auth?redirect=/admin/manage-category'); // Cập nhật redirect link
      } else if (!isAdmin) {
          router.push('/');
      } else {
        fetchCategories();
      }
    }
    // LƯU Ý: Đổi tên file nên cập nhật lại path trong Navbar
  }, [loadingAuth, isLoggedIn, isAdmin, router, fetchCategories]);

  // --- Logic Xử lý Form Thêm Danh mục ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate Front-end: Kiểm tra Tên danh mục (Tối thiểu 3 ký tự)
    const trimmedName = categoryName.trim();
    if (trimmedName.length < 3) {
        setMessage({ type: 'error', text: 'Tên danh mục phải có ít nhất 3 ký tự.' });
        return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
        const response = await apiService.createCategory({
            ten: trimmedName,
            moTa: description.trim(),
        });

        if (response && response.code === 1000) {
            setMessage({ type: 'success', text: `Thêm danh mục '${trimmedName}' thành công!` });
            setCategoryName('');
            setDescription('');
            fetchCategories(); // Tải lại danh sách
        } else {
            // Trường hợp Backend trả về lỗi validation
            setMessage({ type: 'error', text: response?.message || 'Lỗi không xác định khi thêm danh mục.' });
        }
    } catch (err) {
        console.error("Submission error:", err);
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Lỗi kết nối hoặc quyền truy cập bị từ chối.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- Logic Xử lý Xóa Danh mục ---
  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    setDeletingId(id);
    setMessage(null);

    try {
        await apiService.deleteCategory(id);
        setMessage({ type: 'success', text: `Xóa danh mục ID ${id} thành công.` });
        fetchCategories(); // Tải lại danh sách sau khi xóa
    } catch (err) {
        console.error("Deletion error:", err);
        setMessage({ type: 'error', text: err instanceof Error ? err.message : `Xóa danh mục ID ${id} thất bại.` });
    } finally {
        setIsDeleting(false);
        setDeletingId(null);
    }
  };


  // --- Render UI ---
  if (loadingAuth || (!loadingAuth && !isLoggedIn)) {
    // Chỉ hiển thị loading/chuyển hướng
    return (
      <div className="container mx-auto p-8 text-center text-gray-500">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }
  
  if (!isAdmin) {
    // Đã đăng nhập nhưng không phải Admin (sẽ bị chuyển hướng trong useEffect)
    return null;
  }


  // Nếu là ADMIN, hiển thị Form Quản lý
  return (
    <div className="container mx-auto p-4 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-indigo-700 flex items-center">
        <Tags className="h-7 w-7 mr-3" />
        Quản Lý Danh Mục (Admin)
      </h1>

      {/* Message Box */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg shadow-md flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400'}`}>
          <XCircle className="h-5 w-5 mr-3" />
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT 1: THÊM MỚI DANH MỤC */}
        <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" /> Thêm Danh Mục Mới
            </h2>
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-2xl space-y-4">
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">Tên Danh mục</label>
                  <input
                    id="categoryName"
                    type="text"
                    value={categoryName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoryName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Laptop Gaming (Tối thiểu 3 ký tự)"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Mô tả (Tùy chọn)</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition resize-y"
                    rows={3}
                    placeholder="Mô tả chi tiết về danh mục này..."
                    disabled={isSubmitting}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:bg-indigo-400 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Đang thêm...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-5 w-5 mr-2" /> Thêm Danh mục
                    </>
                  )}
                </button>
            </form>
        </div>
        
        {/* CỘT 2 & 3: DANH SÁCH VÀ QUẢN LÝ */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <List className="h-5 w-5 mr-2" /> Danh Sách Danh Mục Hiện Tại
            </h2>
            
            <CategoryList 
                categories={categories} 
                onDelete={handleDelete} 
                isDeleting={isDeleting}
                deletingId={deletingId}
                isLoading={loadingCategories}
            />
        </div>
      </div>
    </div>
  );
};

export default ManageCategoryPage;