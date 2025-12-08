"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { OrderResponse } from '@/types/Product';
import { Loader2, Package, ListOrdered, Info, User, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link'; // Đảm bảo import Link

const OrderHistoryPage: React.FC = () => {
    const router = useRouter();
    const { isLoggedIn, isLoading: loadingAuth } = useAuth();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- Fetch Order History ---
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedOrders = await apiService.getOrderHistory();
            setOrders(fetchedOrders);
        } catch (error: any) {
            console.error("Error fetching orders:", error);
            // Ném lỗi để hiển thị message
            setMessage({ type: 'error', text: error.message || 'Lỗi khi tải lịch sử đơn hàng. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!loadingAuth) {
            if (!isLoggedIn) {
                router.push('/auth?redirect=/orders');
            } else {
                fetchOrders();
            }
        }
    }, [loadingAuth, isLoggedIn, router, fetchOrders]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 border-green-400';
            case 'SHIPPING':
                return 'bg-blue-100 text-blue-700 border-blue-400';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-400';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-400';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-400';
        }
    };
    
    // Nếu chưa xác thực hoặc đang tải auth, hiển thị loading
    if (loadingAuth || (loading && isLoggedIn)) {
         return (
            <div className="container mx-auto p-8 text-center min-h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-3 text-lg text-gray-600">Đang kiểm tra quyền và tải đơn hàng...</span>
            </div>
        );
    }
    
    if (!isLoggedIn) return null; // Sẽ được chuyển hướng bởi useEffect

    const isOrderEmpty = orders.length === 0;

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-indigo-700 flex items-center">
                <ListOrdered className="h-7 w-7 mr-3" />
                Lịch Sử Đơn Hàng Của Tôi
            </h1>

            {/* Message Box */}
            {message && (
                <div className={`p-4 mb-6 rounded-lg shadow-md flex items-center bg-red-100 text-red-700 border-red-400`}>
                    {message.text}
                </div>
            )}

            {isOrderEmpty ? (
                <div className="p-12 text-center bg-white rounded-xl shadow-lg border border-gray-100">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-700">Bạn chưa có đơn hàng nào.</p>
                    <Link href="/" className="mt-4 inline-flex items-center text-indigo-600 hover:underline font-medium">
                        <ShoppingCart className='h-4 w-4 mr-2'/> Bắt đầu mua sắm ngay!
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Link 
                            key={order.id} 
                            href={`/orders/${order.id}`} // SỬ DỤNG LINK ĐẾN TRANG CHI TIẾT
                            className="block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-xl hover:border-indigo-400 cursor-pointer group"
                        >
                            <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-100">
                                <span className="font-semibold text-gray-700">Mã đơn hàng: <span className="text-indigo-600 font-bold">#{order.id}</span></span>
                                <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="p-4 space-y-2">
                                <p className="text-gray-600 text-sm">Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(order.createdAt).toLocaleTimeString('vi-VN')}</p>
                                <p className="text-lg font-extrabold text-red-600">
                                    Tổng tiền: {order.tongTien.toLocaleString('vi-VN')} đ
                                </p>
                                {/* Thay thế button cũ bằng div hiển thị trạng thái link */}
                                <div className="text-indigo-600 text-sm font-medium pt-2 group-hover:underline">
                                    Xem chi tiết đơn hàng &rarr;
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;