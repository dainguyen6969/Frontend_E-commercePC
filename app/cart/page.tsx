"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '@/services/api';
import { GioHangResponse, CartItemResponse, CartItemRequest, OrderCreationRequest, OrderResponse } from '@/types/Product';
import { Loader2, ShoppingCart, Trash2, Plus, Minus, XCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const BACKEND_BASE_URL = "http://localhost:8080/trongdai"; 
const normalizeImageUrl = (path: string) => {
    if (path && path.startsWith('/static/')) {
        return `${BACKEND_BASE_URL}${path}`;
    }
    return path || "https://placehold.co/100x100/F0F4FF/1E40AF?text=No+Image"; 
}

const DEFAULT_SHIPPING_ADDRESS = "Số 1, Đại lộ Thống Nhất, TP.HCM";
const DEFAULT_PAYMENT_METHOD = "COD"; 

// Đảm bảo đây là một functional component
const CartPage: React.FC = () => {
    const router = useRouter();
    const [cart, setCart] = useState<GioHangResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- Fetch Cart Data ---
    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                // Nếu chưa đăng nhập, chuyển hướng
                router.push('/auth?redirect=/cart');
                return;
            }
            const fetchedCart = await apiService.getCart();
            setCart(fetchedCart);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setMessage({ type: 'error', text: 'Lỗi khi tải giỏ hàng. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // --- Cập nhật số lượng item (Thêm/giảm hoặc thay thế) ---
    const updateItemQuantity = useCallback(async (item: CartItemResponse, newQuantity: number) => {
        if (newQuantity < 1) {
            // Nếu số lượng là 0, gọi hàm xóa
            removeItem(item.chiTietGioHangId, item.tenSanPham);
            return;
        }

        setIsUpdating(true);
        setMessage(null);
        try {
            const request: CartItemRequest = {
                productId: item.sanPhamId,
                quantity: newQuantity
            };
            // Gọi API Thêm/Cập nhật Giỏ hàng (Backend xử lý logic cộng/trừ/thay thế)
            const updatedCart = await apiService.addToCart(request);
            setCart(updatedCart);
        } catch (error: any) {
             setMessage({ type: 'error', text: error.message || "Cập nhật số lượng thất bại." });
        } finally {
            setIsUpdating(false);
        }
    }, []);

    // --- Xóa Item khỏi Giỏ hàng ---
    const removeItem = useCallback(async (itemId: number, name: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm '${name}' khỏi giỏ hàng?`)) {
            return;
        }

        setIsUpdating(true);
        setMessage(null);
        try {
            await apiService.removeCartItem(itemId);
            setMessage({ type: 'success', text: `Đã xóa '${name}' khỏi giỏ hàng.` });
            fetchCart(); // Tải lại giỏ hàng
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Xóa mặt hàng thất bại." });
        } finally {
            setIsUpdating(false);
        }
    }, [fetchCart]);

    // --- Đặt hàng (Checkout) ---
    const handleCheckout = async () => {
        if (!cart || cart.items.length === 0) {
            setMessage({ type: 'error', text: 'Giỏ hàng trống, không thể đặt hàng.' });
            return;
        }

        setIsOrdering(true);
        setMessage(null);
        try {
            const request: OrderCreationRequest = {
                diaChiNhanHang: DEFAULT_SHIPPING_ADDRESS, // Giả định địa chỉ
                phuongThucThanhToan: DEFAULT_PAYMENT_METHOD, // Giả định phương thức
            };

            const orderResponse: OrderResponse = await apiService.createOrder(request);

            setMessage({ 
                type: 'success', 
                text: `Đặt hàng thành công! Mã đơn: ${orderResponse.id}. Tổng tiền: ${orderResponse.tongTien.toLocaleString('vi-VN')} đ` 
            });
            setCart(null); // Xóa giỏ hàng sau khi đặt thành công
            
            // Chuyển hướng đến trang lịch sử đơn hàng sau 3 giây
            setTimeout(() => {
                router.push('/orders');
            }, 3000);

        } catch (error: any) {
             setMessage({ type: 'error', text: error.message || "Đặt hàng thất bại. Vui lòng kiểm tra lại giỏ hàng và tồn kho." });
        } finally {
            setIsOrdering(false);
        }
    };


    if (loading) {
        return (
            <div className="container mx-auto p-8 text-center min-h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-3 text-lg text-gray-600">Đang tải giỏ hàng...</span>
            </div>
        );
    }
    
    const cartItems = cart?.items || [];
    const isCartEmpty = cartItems.length === 0;

    return (
        <div className="container mx-auto p-4 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center">
                <ShoppingCart className="h-7 w-7 mr-3" />
                Giỏ Hàng Của Bạn
            </h1>

            {/* Message Box */}
            {message && (
                <div className={`p-4 mb-6 rounded-lg shadow-md flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400'}`}>
                    {message.type === 'error' ? <XCircle className="h-5 w-5 mr-3" /> : <CheckCircle className="h-5 w-5 mr-3" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cột 1 & 2: Danh sách sản phẩm */}
                <div className="lg:col-span-2">
                    {isCartEmpty ? (
                        <div className="p-12 text-center bg-white rounded-xl shadow-lg border border-gray-100">
                            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-gray-700">Giỏ hàng của bạn đang trống.</p>
                            <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
                                Quay lại trang chủ để mua sắm
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map(item => (
                                <div key={item.chiTietGioHangId} className="flex bg-white rounded-xl shadow-md p-4 items-center justify-between border border-gray-100">
                                    
                                    <div className="flex items-center space-x-4">
                                        <div className="relative h-20 w-20 flex-shrink-0">
                                            <Image 
                                                src={normalizeImageUrl(item.anhSanPham)}
                                                alt={item.tenSanPham}
                                                fill
                                                className="object-contain rounded-md"
                                                unoptimized={true}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.tenSanPham}</h3>
                                            <p className="text-sm text-gray-500">{item.giaHienTai.toLocaleString('vi-VN')} đ / sản phẩm</p>
                                        </div>
                                    </div>

                                    {/* Quản lý Số lượng & Xóa */}
                                    <div className="flex items-center space-x-4">
                                        
                                        {/* Số lượng */}
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button 
                                                onClick={() => updateItemQuantity(item, item.soLuong - 1)}
                                                disabled={item.soLuong <= 1 || isUpdating}
                                                className="p-2 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="w-8 text-center font-semibold text-gray-900">{item.soLuong}</span>
                                            <button 
                                                onClick={() => updateItemQuantity(item, item.soLuong + 1)}
                                                disabled={isUpdating}
                                                className="p-2 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        
                                        {/* Thành tiền */}
                                        <p className="font-bold text-red-600 w-24 text-right">
                                            {item.thanhTien.toLocaleString('vi-VN')} đ
                                        </p>
                                        
                                        {/* Xóa */}
                                        <button 
                                            onClick={() => removeItem(item.chiTietGioHangId, item.tenSanPham)}
                                            disabled={isUpdating}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition disabled:opacity-50"
                                            title="Xóa"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cột 3: Tóm tắt Đơn hàng */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 sticky top-20">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">Tóm tắt Đơn hàng</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Tổng số lượng ({cart?.tongSoLuong || 0} sản phẩm)</span>
                                <span>{cart?.tongTienGioHang.toLocaleString('vi-VN') || '0'} đ</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-3">
                                <span>Thành tiền (Tạm tính)</span>
                                <span className="text-red-600">{cart?.tongTienGioHang.toLocaleString('vi-VN') || '0'} đ</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-500 p-3 bg-indigo-50 rounded-lg">
                             <p>Địa chỉ nhận: {DEFAULT_SHIPPING_ADDRESS}</p>
                             <p>Phương thức TT: {DEFAULT_PAYMENT_METHOD}</p>
                             <p className="font-medium text-red-700">Lưu ý: Cần triển khai các trường địa chỉ/thanh toán thực tế.</p>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCartEmpty || isOrdering || isUpdating}
                            className="w-full mt-6 py-3 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-200 disabled:opacity-50 flex items-center justify-center"
                        >
                            {isOrdering ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Đang đặt hàng...
                                </>
                            ) : (
                                `Đặt Hàng (${cart?.tongTienGioHang.toLocaleString('vi-VN') || '0'} đ)`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// *** ĐÂY LÀ CHỖ CẦN THIẾT: Xuất default component ***
export default CartPage;