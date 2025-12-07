import axios from "axios";
// Sửa import để sử dụng SanPham, ApiResponse, SanPhamRequest từ types/Product
import { SanPham, ApiResponse, SanPhamRequest } from "@/types/Product"; 

// --- INTERFACES CHUNG ---

interface ProfileResponse { isValid: boolean; roles: string[]; }
export interface Category { id: number; ten: string; moTa: string; }
interface CategoryRequest { ten: string; moTa: string; }

// **LƯU Ý QUAN TRỌNG:** // Loại bỏ ProductCreationRequest cũ và sử dụng SanPhamRequest đã được import từ types/Product.ts
// interface ProductCreationRequest { ... } <-- Bỏ qua

const API_BASE_URL = 'http://localhost:8080/trongdai';

export const apiService = {
  get: async (url: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(url, config);
      return response;
    } catch (error) {
      console.error("GET error:", error);
      return null;
    }
  },

  introspectToken: async (token: string): Promise<ProfileResponse | null> => {
    try {
        const response = await axios.post<ApiResponse<any>>(`${API_BASE_URL}/auth/introspect`, {
            token: token
        }, { headers: { 'Content-Type': 'application/json' } });
        
        const data = response.data.result;
        const roles = data.roles ?? []; 

        if (response.data.code === 1000 && data.valid) { return { isValid: true, roles: roles, }; } 
        return { isValid: false, roles: [] };
    } catch (error) {
      console.error("API Introspect failed:", error);
      return { isValid: false, roles: [] };
    }
  },

  createCategory: async (categoryData: CategoryRequest) => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

    try {
        const response = await axios.post<ApiResponse<any>>(`${API_BASE_URL}/categories`, categoryData, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        return response.data; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || "Failed to create category.");
        }
        throw new Error("Network or unexpected error occurred during category creation.");
    }
  },

  getAllCategories: async (): Promise<Category[]> => {
    try {
        const token = localStorage.getItem('auth_token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get<ApiResponse<Category[]>>(`${API_BASE_URL}/categories`, config);
        
        if (response.data.code === 1000 && Array.isArray(response.data.result)) { return response.data.result; }
        return [];
    } catch (error) {
        if (axios.isAxiosError(error)) {
             console.error("Error fetching categories:", error.message, error.response?.data);
        } else {
             console.error("Error fetching categories:", error);
        }
        return [];
    }
  },

  deleteCategory: async (danhMucId: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

    try {
        await axios.delete(`${API_BASE_URL}/categories/${danhMucId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        return { success: true, message: "Xóa danh mục thành công." };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || "Failed to create category.");
        }
        throw new Error("Network or unexpected error occurred during category deletion.");
    }
  },

  uploadImageViaBackend: async (file: File): Promise<string> => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post<ApiResponse<{ url: string }>>(`${API_BASE_URL}/files/upload`, 
            formData,
            { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                } 
            }
        );

        if (response.data.code === 1000 && response.data.result?.url) {
            return response.data.result.url; 
        }
        throw new Error(response.data.message || "Backend không trả về URL ảnh hợp lệ.");
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || "Lỗi khi upload ảnh qua Backend.");
        }
        throw new Error("Lỗi mạng khi upload ảnh.");
    }
  },

  createProduct: async (productData: SanPhamRequest) => { // Sử dụng SanPhamRequest
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

    try {
        const response = await axios.post<ApiResponse<any>>(`${API_BASE_URL}/products`, productData, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        return response.data; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const backendError = error.response.data?.message || error.response.data?.result?.message;
            throw new Error(backendError || "Failed to create product.");
        }
        throw new Error("Network or unexpected error occurred during product creation.");
    }
  },

  getAllProductsForAdmin: async (): Promise<SanPham[]> => {
    const token = localStorage.getItem('auth_token');
    if (!token) { return []; }

    try {
        const response = await axios.get<ApiResponse<SanPham[]>>(`${API_BASE_URL}/products`, { 
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data.code === 1000 && Array.isArray(response.data.result)) { 
            return response.data.result; 
        }
        return [];
    } catch (error) {
        if (axios.isAxiosError(error)) {
             console.error("Error fetching products for admin:", error.message, error.response?.data);
        } else {
             console.error("Error fetching products for admin:", error);
        }
        return [];
    }
  },

  // *** THÊM HÀM MỚI: Lấy chi tiết sản phẩm theo ID ***
  getProductById: async (productId: number): Promise<SanPham | null> => {
    try {
        const response = await axios.get<ApiResponse<SanPham>>(`${API_BASE_URL}/products/${productId}`);
        
        if (response.data.code === 1000 && response.data.result) { 
            return response.data.result; 
        }
        return null;
    } catch (error) {
        console.error(`Error fetching product ID ${productId}:`, error);
        return null;
    }
  },

  // *** THÊM HÀM MỚI: Lấy sản phẩm liên quan ***
  getRelatedProducts: async (danhMucId: number, excludedProductId: number): Promise<SanPham[]> => {
    try {
        const response = await axios.get<ApiResponse<SanPham[]>>(`${API_BASE_URL}/products/related/${danhMucId}/${excludedProductId}`);
        
        if (response.data.code === 1000 && Array.isArray(response.data.result)) { 
            return response.data.result; 
        }
        return [];
    } catch (error) {
        console.error("Error fetching related products:", error);
        return [];
    }
  },

  deleteProduct: async (productId: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

    try {
        await axios.delete(`${API_BASE_URL}/products/${productId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        return { success: true, message: "Xóa sản phẩm thành công." };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || `Xóa sản phẩm ID ${productId} thất bại.`);
        }
        throw new Error("Network or unexpected error occurred during product deletion.");
    }
  },
};