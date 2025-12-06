import axios from "axios";

// --- INTERFACES CHUNG ---

interface ApiResponse<T> {
  code: number;
  message: string | null;
  result: T;
}

interface IntrospectResponse { valid: boolean; roles: string[] | null; }
interface ProfileResponse { isValid: boolean; roles: string[]; }

export interface Category { id: number; ten: string; moTa: string; }
interface CategoryRequest { ten: string; moTa: string; }

// Interface cho Product (SanPham) Request
interface ProductCreationRequest {
    ten: string;
    gia: number;
    anh: string; // Chứa URL ảnh đã upload
    danhMucId: number;
    // Thêm các trường khác của SanPham nếu cần
}

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

  // HÀM 1: Introspect Token (Giữ nguyên)
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
            throw new Error(error.response.data?.message || `Xóa danh mục ID ${danhMucId} thất bại.`);
        }
        throw new Error("Network or unexpected error occurred during category deletion.");
    }
  },

  // HÀM MỚI 5: Upload File ảnh qua Backend (Backend lưu và trả về URL)
  uploadImageViaBackend: async (file: File): Promise<string> => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }
    
    // Tạo FormData để chứa file Multipart
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Endpoint /files/upload (Giả định Backend)
        const response = await axios.post<ApiResponse<{ url: string }>>(`${API_BASE_URL}/files/upload`, 
            formData,
            { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                } 
            }
        );

        if (response.data.code === 1000 && response.data.result?.url) {
            return response.data.result.url; // Trả về URL công khai từ Backend
        }
        throw new Error(response.data.message || "Backend không trả về URL ảnh hợp lệ.");
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Lỗi Backend (ví dụ: file quá lớn, không đủ quyền)
            throw new Error(error.response.data?.message || "Lỗi khi upload ảnh qua Backend.");
        }
        throw new Error("Lỗi mạng khi upload ảnh.");
    }
  },

  // HÀM MỚI 6: Tạo Sản phẩm (Gửi dữ liệu cuối cùng, bao gồm URL ảnh)
  createProduct: async (productData: ProductCreationRequest) => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

    try {
        // Endpoint /products (Giả định Backend)
        const response = await axios.post<ApiResponse<any>>(`${API_BASE_URL}/products`, productData, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        return response.data; 
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Lỗi Backend (ví dụ: validation sản phẩm)
            throw new Error(error.response.data?.message || "Failed to create product.");
        }
        throw new Error("Network or unexpected error occurred during product creation.");
    }
  }
};