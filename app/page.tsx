import { apiGet } from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import { SanPham, ApiResponse } from "@/types/Product"; 
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Dribbble, Cpu, HardDrive, Monitor, Component, Zap, Mouse } from "lucide-react";

// Dữ liệu danh mục mock (Giống như cột bên trái trong ảnh)
const categories = [
  { name: 'PC Gaming Cao Cấp', slug: 'pc-gaming', icon: Cpu },
  { name: 'Laptop Gaming', slug: 'laptop-gaming', icon: Zap },
  { name: 'Laptop Văn Phòng', slug: 'laptop-van-phong', icon: Dribbble },
  { name: 'Linh Kiện: CPU/RAM/VGA', slug: 'linh-kien', icon: Component },
  { name: 'Ổ Cứng SSD/HDD', slug: 'o-cung', icon: HardDrive },
  { name: 'Màn Hình Gaming', slug: 'man-hinh', icon: Monitor },
  { name: 'Bàn Phím & Chuột', slug: 'phu-kien', icon: Mouse },
];

// Component Banner (phần Back to School 2024 trong ảnh mẫu)
// Giữ nguyên như phiên bản trước để đảm bảo cấu trúc
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
            unoptimized={true} // Giữ unoptimized cho hình ảnh mock
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

// Component Sidebar (Cột Danh mục bên trái)
const CategorySidebar = () => (
    // Dùng w-full cho mobile, w-64 cho desktop
    <div className="w-full lg:w-64 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Danh mục sản phẩm</h3>
        <ul className="space-y-2">
            {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                    <li key={cat.slug}>
                        <Link href={`/category/${cat.slug}`} className="flex items-center justify-between p-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium transition group">
                            <span className="flex items-center">
                                <Icon className="h-5 w-5 mr-3 opacity-80" />
                                {cat.name}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition" />
                        </Link>
                    </li>
                );
            })}
        </ul>
    </div>
);

// Component chính của trang chủ (Server Component)
export default async function HomePage() {
  let products: SanPham[] = [];

  try {
    const response: ApiResponse<SanPham[]> = await apiGet("/products");
    
    if (response && Array.isArray(response.result)) {
      products = response.result;
    } else {
      console.error("API did not return a valid array in the 'result' field:", response);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  return (
    <div className="container mx-auto p-4 lg:p-8 font-sans">
      
      {/* 1. HERO SECTION: Banner and Sidebar (Mobile: Stacked, Desktop: Side-by-side) */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        {/* Sidebar chỉ hiện trên màn hình lớn */}
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <CategorySidebar />
        </div>
        {/* Banner chiếm phần còn lại */}
        <div className="flex-grow">
            <HeroBanner />
        </div>
      </div>
      
      {/* 2. PRODUCTS SECTION (Sản phẩm nổi bật) */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-indigo-600/50 pb-2">
            Sản phẩm nổi bật
        </h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500 p-8 text-center bg-white rounded-xl shadow">
            Không có sản phẩm nào được tìm thấy. Vui lòng kiểm tra Server Backend.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {products.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 3. UTILITY BLOCKS */}
      <UtilityBlocks />

    </div>
  );
}

// Khối tiện ích (nhỏ gọn ở cuối trang, tôi sẽ dùng mock data đơn giản)
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


