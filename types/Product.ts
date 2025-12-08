export interface SanPham {
  id: number;
  ten: string;
  gia: number;
  anh: string; 
  
  moTa?: string; 
  soLuong?: number; 
  danhMucId?: any; 
  danhMucTen?: string; 
  
  createdAt?: string;
  updatedAt?: string;
}

// Interface cho cấu trúc phản hồi API chung của Spring Boot
export interface ApiResponse<T> {
  code: number;
  message: string | null;
  result: T;
}

// DTO cho request tạo sản phẩm
export interface SanPhamRequest {
    ten: string;
    gia: number;
    anh: string;
    danhMucId: number;
    moTa: string;
    soLuong: number;
}

// --- USER INTERFACES ---

export interface DiaChi { // Export DiaChi
    id: number;
    thanhPho: string;
    xaPhuong: string;
    diaChiHienTai: string;
    phone: string; // Thêm phone theo Entity Java mới
}

// Định nghĩa DiaChiResponse để tương thích với API Service
export interface DiaChiResponse extends DiaChi {} 

export interface UserResponse { // Export UserResponse
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone: string;
    status: boolean;
    diaChi: DiaChi[]; // List of addresses (nhúng trong hồ sơ chính)
}

export interface UserUpdateRequest { // Export UserUpdateRequest
    email: string;
    fullName: string;
    phone: string;
}


// --- CART & ORDER INTERFACES ---
export interface CartItemRequest {
    productId: number;
    quantity: number; 
}

export interface CartItemResponse {
    chiTietGioHangId: number; 
    sanPhamId: number;
    tenSanPham: string;
    anhSanPham: string;
    soLuong: number;
    giaHienTai: number;
    thanhTien: number;
}

export interface GioHangResponse {
    gioHangId: number;
    items: CartItemResponse[];
    tongTienGioHang: number;
    tongSoLuong: number;
}

// Interface cho chi tiết một mặt hàng trong đơn hàng
export interface OrderItemResponse { 
    chiTietDonHangId: number; 
    sanPhamId: number;
    tenSanPham: string;
    anhSanPham: string;
    soLuong: number;
    giaMua: number; // Giá tại thời điểm mua
    thanhTien: number;
}

// Interface cho toàn bộ chi tiết đơn hàng
export interface OrderDetailResponse {
    id: number;
    tongTien: number;
    status: string;
    createdAt: string;
    
    diaChiNhanHang: string;
    phuongThucThanhToan: string;
    
    items: OrderItemResponse[];
}


export interface OrderCreationRequest {
    diaChiNhanHang: string; 
    phuongThucThanhToan: string; 
}

export interface OrderResponse {
    id: number;
    tongTien: number;
    status: string;
    createdAt: string;
}