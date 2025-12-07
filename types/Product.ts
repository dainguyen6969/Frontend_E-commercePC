export interface SanPham {
  id: number;
  ten: string;
  gia: number;
  anh: string; 
  
  // Các trường chi tiết ĐÃ GỘP vào SanPham
  moTa?: string; 
  // Đã bỏ: thuocTinh, giaTri
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

// DTO cho request tạo sản phẩm (đồng bộ với SanPhamRequest.java)
export interface SanPhamRequest {
    ten: string;
    gia: number;
    anh: string;
    danhMucId: number;
    moTa: string;
    // Đã bỏ: thuocTinh, giaTri
    soLuong: number;
}