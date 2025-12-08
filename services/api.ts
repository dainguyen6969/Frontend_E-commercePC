import axios from "axios";
import { 
    SanPham, 
    ApiResponse, 
    SanPhamRequest, 
    GioHangResponse, 
    CartItemRequest, 
    OrderCreationRequest, 
    OrderResponse,
    UserResponse, 
    UserUpdateRequest, 
    DiaChiResponse, // <-- Đã được import
    OrderDetailResponse // <-- Đã được import
} from "@/types/Product"; 

// --- INTERFACES CHUNG ---
interface ProfileResponse { isValid: boolean; roles: string[]; }
export interface Category { id: number; ten: string; moTa: string; }
interface CategoryRequest { ten: string; moTa: string; }

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
  
  // *** USER PROFILE METHODS ***
  
    getMyProfile: async (): Promise<UserResponse | null> => {
        const token = localStorage.getItem('auth_token');
        if (!token) { return null; }

        try {
            const response = await axios.get<ApiResponse<UserResponse>>(`${API_BASE_URL}/users/my-profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.code === 1000 && response.data.result) { return response.data.result; }
            return null;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            return null;
        }
    },
    
    updateMyProfile: async (request: UserUpdateRequest): Promise<UserResponse> => {
        const token = localStorage.getItem('auth_token');
        if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

        try {
            const response = await axios.put<ApiResponse<UserResponse>>(`${API_BASE_URL}/users/my-profile`, request, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (response.data.code === 1000 && response.data.result) { return response.data.result; }
            throw new Error(response.data.message || "Failed to update profile.");
        } catch (error) {
            const msg = (axios.isAxiosError(error) && error.response?.data?.message) || "Lỗi cập nhật hồ sơ.";
            throw new Error(msg);
        }
    },
    
    // --- PHƯƠNG THỨC LẤY TẤT CẢ ĐỊA CHỈ (Đã sửa lỗi is not a function) ---
    getAllAddresses: async (): Promise<DiaChiResponse[]> => {
        const token = localStorage.getItem('auth_token');
        if (!token) { return []; }

        try {
            // Gọi endpoint GET /users/addresses
            const response = await axios.get<ApiResponse<DiaChiResponse[]>>(`${API_BASE_URL}/users/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data.code === 1000 && Array.isArray(response.data.result)) { 
                return response.data.result; 
            }
            return [];
        } catch (error) {
            // Logging lỗi chi tiết 500 (Đã được bạn cung cấp)
            console.error("Error fetching user addresses:", error);
            // Xử lý lỗi Axios để trả về thông báo rõ ràng hơn
            if (axios.isAxiosError(error) && error.response) {
                const msg = error.response.data?.message || `Lỗi server: ${error.response.statusText}`;
                 // Quan trọng: Phải ném lỗi để Frontend bắt được và hiển thị message
                throw new Error(msg); 
            }
            return [];
        }
    },
    
    addAddress: async (request: any): Promise<UserResponse> => { // Sử dụng any cho request address để đơn giản
        const token = localStorage.getItem('auth_token');
        if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

        try {
            const response = await axios.post<ApiResponse<UserResponse>>(`${API_BASE_URL}/users/addresses`, request, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (response.data.code === 1000 && response.data.result) { return response.data.result; }
            throw new Error(response.data.message || "Failed to add address.");
        } catch (error) {
            const msg = (axios.isAxiosError(error) && error.response?.data?.message) || "Lỗi thêm địa chỉ.";
            throw new Error(msg);
        }
    },
    
    deleteAddress: async (diaChiId: number): Promise<UserResponse> => {
        const token = localStorage.getItem('auth_token');
        if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

        try {
            const response = await axios.delete<ApiResponse<UserResponse>>(`${API_BASE_URL}/users/addresses/${diaChiId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.code === 1000 && response.data.result) { return response.data.result; }
            throw new Error(response.data.message || "Failed to delete address.");
        } catch (error) {
            const msg = (axios.isAxiosError(error) && error.response?.data?.message) || "Lỗi xóa địa chỉ.";
            throw new Error(msg);
        }
    },
    
    // --- PHƯƠNG THỨC LẤY CHI TIẾT ĐƠN HÀNG ---
    getOrderDetail: async (orderId: number): Promise<OrderDetailResponse | null> => {
        const token = localStorage.getItem('auth_token');
        if (!token) { return null; }

        // Endpoint giả định: /orders/{orderId}
        try {
            const response = await axios.get<ApiResponse<OrderDetailResponse>>(`${API_BASE_URL}/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.data.code === 1000 && response.data.result) { 
                return response.data.result; 
            }
            return null;
        } catch (error) {
            console.error(`Error fetching order detail ID ${orderId}:`, error);
            // Ném lỗi cụ thể cho Frontend xử lý hiển thị thông báo
            if (axios.isAxiosError(error) && error.response) {
                 const msg = error.response.data?.message || `Lỗi server: ${error.response.statusText}`;
                 throw new Error(msg);
            }
            return null;
        }
    },
    
  // *** HÀM CART/ORDER KHÁC (Giữ nguyên) ***
  getCart: async (): Promise<GioHangResponse | null> => {
    const token = localStorage.getItem('auth_token');
    if (!token) { return null; }

    try {
        const response = await axios.get<ApiResponse<GioHangResponse>>(`${API_BASE_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.code === 1000 && response.data.result) { return response.data.result; }
        throw new Error(response.data.message || "Failed to fetch cart.");
    } catch (error) {
        const msg = (axios.isAxiosError(error) && error.response?.data?.message) || "Lỗi mạng hoặc Backend";
        throw new Error(msg);
    }
  },

  addToCart: async (request: CartItemRequest): Promise<GioHangResponse> => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

    try {
        const response = await axios.post<ApiResponse<GioHangResponse>>(`${API_BASE_URL}/cart/items`, request, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (response.data.code === 1000 && response.data.result) { return response.data.result; }
        throw new Error(response.data.message || "Failed to add/update cart.");
    } catch (error) {
        const msg = (axios.isAxiosError(error) && error.response?.data?.message) || "Lỗi mạng hoặc Backend";
        throw new Error(msg);
    }
  },
  
  removeCartItem: async (itemId: number): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

    try {
        await axios.delete(`${API_BASE_URL}/cart/items/${itemId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        const msg = (axios.isAxiosError(error) && error.response?.data?.message) || "Xóa mặt hàng thất bại";
        throw new Error(msg);
    }
  },

  createOrder: async (request: OrderCreationRequest): Promise<OrderResponse> => {
    const token = localStorage.getItem('auth_token');
    if (!token) { throw new Error("Unauthorized: Missing authentication token."); }

    try {
        const response = await axios.post<ApiResponse<OrderResponse>>(`${API_BASE_URL}/orders`, request, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (response.data.code === 1000 && response.data.result) { return response.data.result; }
        throw new Error(response.data.message || "Failed to create order.");
    } catch (error) {
        const msg = (axios.isAxiosError(error) && error.response?.data?.message) || "Lỗi mạng hoặc giỏ hàng trống.";
        throw new Error(msg);
    }
  },

  getOrderHistory: async (): Promise<OrderResponse[]> => {
    const token = localStorage.getItem('auth_token');
    if (!token) { return []; }

    try {
        const response = await axios.get<ApiResponse<OrderResponse[]>>(`${API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.code === 1000 && Array.isArray(response.data.result)) { return response.data.result; }
        return [];
    } catch (error) {
        console.error("Error fetching order history:", error);
        return [];
    }
  }
};