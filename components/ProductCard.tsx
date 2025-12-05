import Image from "next/image";
import Link from "next/link";
import { SanPham } from "@/types/Product"; 
import { Star, ShoppingCart } from "lucide-react"; 

// Hàm giả định giá gốc để tạo hiệu ứng giảm giá (ví dụ giảm 15%)
const getOldPrice = (currentPrice: number) => Math.floor(currentPrice / 0.85);

export default function ProductCard({ product }: { product: SanPham }) {
  // Định dạng tiền tệ
  const formattedPrice = product.gia ? product.gia.toLocaleString('vi-VN') : 'N/A';
  const oldPrice = getOldPrice(product.gia || 0).toLocaleString('vi-VN');

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 cursor-pointer h-full">
      
      {/* Product Image Wrapper */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        <Link href={`/products/${product.id}`} className="w-full h-full relative">
            <Image
            src={product.anh || "https://placehold.co/400x300/F0F4FF/1E40AF?text=No+Image"}
            alt={product.ten}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={true} // Giữ unoptimized cho hình ảnh mock để tránh lỗi 400/500
            />
        </Link>
        
        {/* Discount Tag */}
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10">
            -15%
        </div>

        {/* Hover Action: Quick Add to Cart */}
        <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <button className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-white text-indigo-600 p-3 rounded-full hover:bg-indigo-600 hover:text-white shadow-xl flex items-center justify-center" title="Thêm vào giỏ hàng">
                <ShoppingCart className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Category (Optional Mock) */}
        <span className="text-xs text-gray-400 font-medium uppercase mb-1">TechZone</span>

        {/* Product Name */}
        <Link href={`/products/${product.id}`} className="block flex-grow">
            <h3 className="text-sm font-bold text-gray-800 leading-snug hover:text-indigo-600 transition line-clamp-2 min-h-[40px]" title={product.ten}>
                {product.ten}
            </h3>
        </Link>
        
        {/* Price & Rating Section */}
        <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 line-through decoration-gray-400">
                        {oldPrice} đ
                    </span>
                    <span className="text-lg font-extrabold text-red-600">
                        {formattedPrice} đ
                    </span>
                </div>
                
                {/* Rating Stars (Mock) */}
                <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-3 w-3 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                        ))}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5">(12 đánh giá)</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}