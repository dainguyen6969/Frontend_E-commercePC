import { apiGet } from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import { SanPham, ApiResponse } from "@/types/Product"; 
import { Category } from "@/services/api"; // <-- Import Category interface từ services/api.ts
import Image from "next/image";
import Link from "next/link";
import AdminDashboardLink from "@/components/AdminDashboardLink"; 
import { ChevronRight, Dribbble, Cpu, HardDrive, Monitor, Component, Zap, Mouse } from "lucide-react";
import { LucideIcon } from 'lucide-react'; // Import LucideIcon type

// Dữ liệu mock CẦN THIẾT để ÁNH XẠ ICON (Giả định ánh xạ dựa trên tên hoặc slug)
const ICON_MAP: { [key: string]: LucideIcon } = {
  'pc-gaming': Cpu,
  'laptop-gaming': Zap,
  'laptop-van-phong': Dribbble,
  'linh-kien': Component,
  'o-cung': HardDrive,
  'man-hinh': Monitor,
  'phu-kien': Mouse,
  // Cần thêm các slug hoặc tên từ Backend của bạn vào đây
  'default': Dribbble // Icon mặc định nếu không khớp
};

// Interface kết hợp dữ liệu Category từ Backend và Icon
interface CategoryData extends Category {
    icon: LucideIcon;
}

// HÀM TIỆN ÍCH MỚI: Xáo trộn mảng theo thuật toán Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;

    // Lặp cho đến khi không còn phần tử nào để xáo trộn.
    while (currentIndex !== 0) {

        // Chọn một phần tử còn lại.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Đổi chỗ nó với phần tử hiện tại.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}


// Component Banner (Giữ nguyên)
const HeroBanner = () => (
    <div className="relative h-96 bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
        {/* Hình nền Banner */}
        <Image 
            src="https://picsum.photos/id/249/1920/1080"
            alt="Back to School Campaign"
            fill
            className="object-cover opacity-70"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
            unoptimized={true} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-transparent p-10 flex flex-col justify-center">
            <span className="text-yellow-400 font-semibold uppercase tracking-widest text-sm mb-2">PC & LAPTOP</span>
            <h2 className="text-5xl font-extrabold text-white leading-tight">
                Back to School 2024
            </h2>
            <p className="text-gray-300 mt-2 max-w-md">
                Sở hữu ngay các cấu hình PC, Laptop hiệu năng cao với ưu đãi lớn!
            </p>
            <Link href="/products?tag=back-to-school" className="mt-6 w-fit inline-flex items-center bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300">
                Khám phá ngay <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
        </div>
    </div>
);

// Component Sidebar (Giữ nguyên)
const CategorySidebar = ({ categories }: { categories: CategoryData[] }) => (
    <div className="w-full lg:w-64 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Danh mục sản phẩm</h3>
        <ul className="space-y-2">
            {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                    // Sử dụng ID của danh mục từ Backend để tạo đường dẫn chi tiết
                    <li key={cat.id || cat.ten}> 
                        <Link href={`/category/${cat.id}`} className="flex items-center justify-between p-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition group">
                            <span className="flex items-center">
                                {/* Dùng Icon đã ánh xạ */}
                                <Icon className="h-5 w-5 mr-3 opacity-80" />
                                {cat.ten} {/* Hiển thị tên từ Backend */}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition" />
                        </Link>
                    </li>
                );
            })}
        </ul>
         {categories.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Không tìm thấy danh mục nào.</p>
        )}
    </div>
);

// Component chính của trang chủ (Server Component)
export default async function HomePage() {
  let products: SanPham[] = [];
  let categoriesData: CategoryData[] = [];

  // --- 1. FETCH PRODUCTS ---
  try {
    const productsResponse: ApiResponse<SanPham[]> = await apiGet("/products");
    
    if (productsResponse && Array.isArray(productsResponse.result)) {
      products = productsResponse.result;
    } else {
      console.error("API did not return a valid products array:", productsResponse);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }
  
  // --- THỰC HIỆN XÁO TRỘN SẢN PHẨM ---
  const shuffledProducts = shuffleArray([...products]); // Tạo bản sao để xáo trộn


  // --- 2. FETCH CATEGORIES (Sử dụng endpoint GET /categories) ---
  try {
    const categoriesResponse: ApiResponse<Category[]> = await apiGet("/categories");
    
    if (categoriesResponse && Array.isArray(categoriesResponse.result)) {
        // Ánh xạ dữ liệu Backend vào cấu trúc có Icon
        categoriesData = categoriesResponse.result.map(cat => {
            // Logic tạm thời để ánh xạ icon (nên dựa vào ID hoặc một trường code/slug từ Backend)
            const simpleSlug = cat.ten.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const Icon = ICON_MAP[simpleSlug] || ICON_MAP['default'];
            return {
                ...cat,
                icon: Icon
            };
        });
    } else {
      console.error("API did not return a valid categories array:", categoriesResponse);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }


  return (
    <div className="container mx-auto p-4 lg:p-8 font-sans">
      
      {/* 1. KHỐI PHÂN QUYỀN ADMIN */}
      <AdminDashboardLink /> 
      
      {/* 2. HERO SECTION: Banner and Sidebar (Mobile: Stacked, Desktop: Side-by-side) */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        {/* Sidebar sử dụng categoriesData (dữ liệu đã fetch) */}
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <CategorySidebar categories={categoriesData} />
        </div>
        {/* Banner chiếm phần còn lại */}
        <div className="flex-grow">
            <HeroBanner />
        </div>
      </div>
      
      {/* 3. PRODUCTS SECTION (Sản phẩm nổi bật) */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-indigo-600/50 pb-2">
            Sản phẩm nổi bật
        </h2>
        
        {shuffledProducts.length === 0 ? (
          <p className="text-gray-500 p-8 text-center bg-white rounded-xl shadow">
            Không có sản phẩm nào được tìm thấy. Vui lòng kiểm tra Server Backend.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {/* SỬ DỤNG shuffledProducts VÀ CẮT LẤY 12 SẢN PHẨM */}
            {shuffledProducts.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. UTILITY BLOCKS */}
      <UtilityBlocks />

    </div>
  );
}

// Khối tiện ích (Giữ nguyên)
const UtilityBlocks = () => (
  <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
    {[
      { title: "Giao hàng tận nơi", desc: "Miễn phí vận chuyển", icon: "shipping" },
      { title: "Cam kết chính hãng", desc: "Bảo hành tiêu chuẩn", icon: "warranty" },
      { title: "Bảo mật thông tin", desc: "An toàn tuyệt đối", icon: "security" },
      { title: "Hỗ trợ 24/7", desc: "Tư vấn nhanh chóng", icon: "support" },
    ].map((item, index) => (
      <div key={index} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
        {/* Thay thế bằng Lucide Icons thực tế nếu bạn muốn */}
        <div className="text-indigo-600 mb-2 h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100">
             {/* Dùng một icon chung cho đơn giản */}
             <Zap className="h-6 w-6" />
        </div>
        <h4 className="font-bold text-center text-gray-800 mt-1">{item.title}</h4>
        <p className="text-xs text-gray-500 text-center">{item.desc}</p>
      </div>
    ))}
  </div>
);