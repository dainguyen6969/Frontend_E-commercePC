export interface SanPham {
  id: number;
  ten: string;
  gia: number;
  anh: string; // Tên trường ảnh từ Backend (SanPham.java)
  // Bạn có thể thêm các trường khác nếu cần thiết (ví dụ: moTa, danhMuc, ...)
  moTa?: string; 
  danhMucId?: any; // Tùy thuộc vào cấu trúc của DanhMuc
  createdAt?: string;
  updatedAt?: string;
}

// Interface cho cấu trúc phản hồi API chung của Spring Boot
export interface ApiResponse<T> {
  code: number;
  message: string | null;
  result: T;
}