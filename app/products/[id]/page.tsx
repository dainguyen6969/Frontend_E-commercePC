"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { apiService } from '@/services/api'; 
import { SanPham, CartItemRequest } from '@/types/Product'; // Import CartItemRequest
import { ShoppingCart, Star, Plus, Minus, Package, Loader2, Info } from 'lucide-react';
import ProductCard from '@/components/ProductCard'; 

// URL cơ sở của Backend 
const BACKEND_BASE_URL = "http://localhost:8080/trongdai"; 
const normalizeImageUrl = (path: string) => {
    if (path && path.startsWith('/static/')) {
        return `${BACKEND_BASE_URL}${path}`;
    }
    return path || "https://placehold.co/600x400/F0F4FF/1E40AF?text=No+Image"; 
}

// Hàm giả định giá gốc để tạo hiệu ứng giảm giá (ví dụ giảm 15%)
const getOldPrice = (currentPrice: number) => Math.floor(currentPrice / 0.85);

const ProductDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const productId = Array.isArray(params.id) ? params.id[0] : params.id;
    const numericProductId = parseInt(productId as string);

    const [product, setProduct] = useState<SanPham | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<SanPham[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- Logic Fetch Data ---
    const fetchProductData = useCallback(async () => {
        if (isNaN(numericProductId)) {
            setLoading(false);
            return;
        }

        setLoading(true);
        // 1. Lấy chi tiết sản phẩm
        const fetchedProduct = await apiService.getProductById(numericProductId);
        
        if (fetchedProduct) {
            setProduct(fetchedProduct);

            // 2. Lấy sản phẩm liên quan (nếu có danh mục)
            if (fetchedProduct.danhMucId) {
                const danhMucId = fetchedProduct.danhMucId.id || fetchedProduct.danhMucId;
                const related = await apiService.getRelatedProducts(danhMucId, numericProductId);
                setRelatedProducts(related);
            }
        } else {
            setProduct(null);
        }
        setLoading(false);
    }, [numericProductId]);

    useEffect(() => {
        fetchProductData();
        window.scrollTo(0, 0);
    }, [fetchProductData]);

    // --- Logic Quản lý Số lượng ---
    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => {
            const newQty = prev + delta;
            const max = product?.soLuong || 1;
            if (newQty < 1) return 1;
            if (newQty > max) return max;
            return newQty;
        });
    };

    // --- Logic Thêm vào Giỏ hàng (Cập nhật thành API thật) ---
    const handleAddToCart = async () => {
        if (!product) return; 
        
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setMessage({ type: 'error', text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.' });
            router.push('/auth');
            return;
        }

        if (quantity > (product.soLuong || 0)) {
             setMessage({ type: 'error', text: 'Số lượng yêu cầu vượt quá tồn kho.' });
             return;
        }
        
        // --- THỰC HIỆN API THÊM GIỎ HÀNG THẬT ---
        setMessage({ type: 'success', text: 'Đang thêm sản phẩm vào giỏ hàng...' });

        try {
            const request: CartItemRequest = {
                productId: product.id,
                quantity: quantity
            };
            
            // Gọi API addToCart (POST /cart/items)
            const updatedCart = await apiService.addToCart(request);

            setMessage({ 
                type: 'success', 
                text: `Đã thêm ${quantity} x ${product.ten} vào giỏ hàng thành công!` 
            });
            
            console.log("Giỏ hàng hiện tại:", updatedCart);

        } catch (error: any) {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
            // FIX: Đảm bảo hiển thị thông báo lỗi chi tiết từ Backend/Axios
            const errorMsg = error.message || 'Thêm vào giỏ hàng thất bại. Vui lòng kiểm tra Server.';
            setMessage({ 
                type: 'error', 
                text: errorMsg
            });
        }
        
        setTimeout(() => setMessage(null), 3000);
    };


    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center min-h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-3 text-lg text-gray-600">Đang tải chi tiết sản phẩm...</span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto p-8 text-center min-h-96 flex flex-col items-center justify-center">
                <Info className="h-10 w-10 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-red-600">Không tìm thấy Sản phẩm</h1>
                <p className="text-gray-600 mt-2">ID sản phẩm không hợp lệ hoặc sản phẩm không tồn tại.</p>
            </div>
        );
    }
    
    // Data cho hiển thị
    const imageUrl = normalizeImageUrl(product.anh);
    const formattedPrice = product.gia ? product.gia.toLocaleString('vi-VN') : 'N/A';
    const oldPrice = getOldPrice(product.gia || 0).toLocaleString('vi-VN');


    return (
        <div className="container mx-auto p-4 lg:p-8 font-sans">
            
            {/* Thông báo */}
            {message && (
                <div className={`p-4 mb-6 rounded-lg shadow-md flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Chi tiết Sản phẩm */}
            <div className="bg-white rounded-xl shadow-2xl p-6 lg:p-10 mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Cột 1: Hình ảnh */}
                <div className="relative h-96 w-full overflow-hidden bg-gray-50 rounded-lg shadow-lg flex items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt={product.ten || 'Product Image'}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        unoptimized={true}
                    />
                </div>

                {/* Cột 2: Thông tin & Mua hàng */}
                <div>
                    {/* Breadcrumbs (Mock) */}
                    <p className="text-sm text-indigo-600 mb-2">
                        {product.danhMucTen ? product.danhMucTen : 'Sản phẩm'}
                    </p>
                    
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.ten}</h1>
                    
                    {/* Rating (Mock) */}
                    <div className="flex items-center space-x-2 mb-6">
                         {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`h-4 w-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                        ))}
                        <span className="text-sm text-gray-500">(12 đánh giá)</span>
                    </div>

                    {/* Giá */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xl text-gray-500 line-through decoration-gray-400 block">
                            {oldPrice} đ
                        </span>
                        <span className="text-4xl font-extrabold text-red-600">
                            {formattedPrice} đ
                        </span>
                    </div>

                    {/* Tồn kho */}
                    <div className="space-y-3 mb-6 text-sm">
                        <p className="font-medium text-gray-700">
                           Tình trạng: <span className={`font-bold ${product.soLuong && product.soLuong > 0 ? 'text-green-600' : 'text-red-600'}`}>
                               {product.soLuong && product.soLuong > 0 ? `Còn hàng (${product.soLuong} sản phẩm)` : 'Hết hàng'}
                           </span>
                        </p>
                    </div>

                    {/* Thêm vào Giỏ hàng */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-gray-300 rounded-lg p-1">
                            <button 
                                onClick={() => handleQuantityChange(-1)} 
                                disabled={quantity <= 1}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, Math.min(product.soLuong || 1, parseInt(e.target.value) || 1)))}
                                min={1}
                                max={product.soLuong}
                                readOnly
                                className="w-12 text-center border-x border-gray-300 mx-1 focus:outline-none font-semibold text-gray-900"
                            />
                            <button 
                                onClick={() => handleQuantityChange(1)} 
                                disabled={quantity >= (product.soLuong || 1) || (product.soLuong === 0)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!product.soLuong || product.soLuong === 0}
                            className="flex items-center justify-center flex-grow py-3 px-6 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 disabled:bg-gray-400"
                        >
                            <ShoppingCart className="h-5 w-5 mr-3" />
                            Thêm vào Giỏ hàng
                        </button>
                    </div>
                </div>
            </div>

            {/* Chi tiết Mô tả */}
            <section className="bg-white rounded-xl shadow-2xl p-6 lg:p-10 mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-indigo-500/50 pb-2 flex items-center">
                    <Package className="h-6 w-6 mr-2" /> Mô tả Sản phẩm
                </h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                    {product.moTa || "Sản phẩm này hiện chưa có mô tả chi tiết."}
                </div>
            </section>

            {/* Sản phẩm Liên quan */}
            {relatedProducts.length > 0 && (
                 <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-red-500/50 pb-2">
                        Sản phẩm Cùng danh mục
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {relatedProducts.map((p) => (
                            // Sử dụng lại ProductCard để hiển thị các sản phẩm liên quan
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {relatedProducts.length === 0 && !loading && (
                 <p className="text-gray-500 p-8 text-center bg-white rounded-xl shadow">
                    Không có sản phẩm liên quan nào được tìm thấy trong danh mục này.
                </p>
            )}

        </div>
    );
};

export default ProductDetailPage;