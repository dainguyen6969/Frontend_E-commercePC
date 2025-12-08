"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { OrderDetailResponse, OrderItemResponse } from '@/types/Product'; // Import OrderDetailResponse
import { Loader2, Package, ListOrdered, MapPin, CreditCard, ShoppingBag, ArrowLeft, Info } from 'lucide-react'; // Đã thêm Info
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';

// URL cơ sở của Backend
const BACKEND_BASE_URL = "http://localhost:8080/trongdai"; 
const normalizeImageUrl = (path: string) => {
    if (path && path.startsWith('/static/')) {
        return `${BACKEND_BASE_URL}${path}`;
    }
    return path || "https://placehold.co/100x100/F0F4FF/1E40AF?text=No+Image"; 
}

// KHẮC PHỤC LỖI EXPORT: Sử dụng export default function trực tiếp
export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { isLoggedIn, isLoading: loadingAuth } = useAuth();
    
    // Lấy ID và chuyển đổi sang số nguyên
    const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
    const numericOrderId = parseInt(orderId as string);

    const [orderDetail, setOrderDetail] = useState<OrderDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // --- Fetch Order Detail ---
    const fetchOrderDetail = useCallback(async () => {
        if (isNaN(numericOrderId)) {
            setLoading(false);
            setMessage({ type: 'error', text: 'Mã đơn hàng không hợp lệ.' });
            return;
        }

        setLoading(true);
        try {
            const detail = await apiService.getOrderDetail(numericOrderId);
            
            if (detail) {
                setOrderDetail(detail);
            } else {
                setMessage({ type: 'error', text: 'Không tìm thấy chi tiết đơn hàng này.' });
            }
        } catch (error: any) {
            console.error("Error fetching order detail:", error);
            setMessage({ type: 'error', text: error.message || 'Lỗi khi tải chi tiết đơn hàng.' });
        } finally {
            setLoading(false);
        }
    }, [numericOrderId]);

    useEffect(() => {
        if (!loadingAuth) {
            if (!isLoggedIn) {
                router.push(`/auth?redirect=/orders/${orderId}`);
            } else {
                fetchOrderDetail();
            }
        }
    }, [loadingAuth, isLoggedIn, router, fetchOrderDetail, orderId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-400';
            case 'SHIPPING': return 'bg-blue-100 text-blue-700 border-blue-400';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-400';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-400';
            default: return 'bg-gray-100 text-gray-700 border-gray-400';
        }
    };
    
    // Loading State
    if (loadingAuth || (loading && isLoggedIn)) {
         return (
            <div className="container mx-auto p-8 text-center min-h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-3 text-lg text-gray-600">Đang tải chi tiết đơn hàng...</span>
            </div>
        );
    }
    
    if (!isLoggedIn) return null; // Sẽ được chuyển hướng bởi useEffect

    // Error Message
    if (message && message.type === 'error' && !orderDetail) {
         return (
            <div className="container mx-auto p-8 max-w-4xl">
                 <Link href="/orders" className="text-indigo-600 hover:text-indigo-800 flex items-center mb-6">
                    <ArrowLeft className='h-4 w-4 mr-2'/> Quay lại lịch sử đơn hàng
                </Link>
                <div className="p-12 text-center bg-white rounded-xl shadow-lg border border-red-300">
                    <Info className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-red-700">{message.text}</p>
                </div>
            </div>
        );
    }

    if (!orderDetail) return null; // Should be handled by the error block above

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-5xl">
            
            <Link href="/orders" className="text-indigo-600 hover:text-indigo-800 flex items-center mb-6 font-medium">
                <ArrowLeft className='h-4 w-4 mr-2'/> Quay lại lịch sử đơn hàng
            </Link>

            <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
                <ListOrdered className="h-7 w-7 mr-3 text-indigo-600" />
                Chi Tiết Đơn Hàng #{orderDetail.id}
            </h1>

            {/* Thông tin Tổng quan & Trạng thái */}
            <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                 
                <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <span className={`text-base font-bold px-3 py-1 rounded-lg border ${getStatusColor(orderDetail.status)} mt-1 inline-block`}>
                        {orderDetail.status}
                    </span>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Ngày đặt</p>
                    {/* FIX: Kiểm tra orderDetail.createdAt trước khi gọi new Date */}
                    <p className="font-semibold text-gray-800 mt-1">{orderDetail.createdAt ? new Date(orderDetail.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                    <p className="text-xs text-gray-500">{orderDetail.createdAt ? new Date(orderDetail.createdAt).toLocaleTimeString('vi-VN') : ''}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Tổng tiền</p>
                    <p className="text-2xl font-extrabold text-red-600 mt-1">{orderDetail.tongTien.toLocaleString('vi-VN')} đ</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cột 1 & 2: Danh sách sản phẩm */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2" /> Sản phẩm đã mua
                    </h2>
                    
                    <div className="space-y-4">
                        {orderDetail.items && orderDetail.items.length > 0 ? (
                            orderDetail.items.map((item: OrderItemResponse) => (
                                <div key={item.chiTietDonHangId} className="flex bg-white rounded-xl shadow-md p-4 items-center justify-between border border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative h-16 w-16 flex-shrink-0">
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
                                            <p className="text-sm text-gray-500">Giá mua: {(item.giaMua ?? 0).toLocaleString('vi-VN')} đ</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Số lượng: <span className="font-bold text-gray-900">{item.soLuong}</span></p>
                                        <p className="font-bold text-red-600 mt-1">
                                            Thành tiền: {(item.thanhTien ?? 0).toLocaleString('vi-VN')} đ
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg">Không có mặt hàng nào được tìm thấy.</p>
                        )}
                    </div>
                </div>

                {/* Cột 3: Thông tin Giao nhận */}
                <div className="lg:col-span-1 space-y-8">
                    
                    {/* Địa chỉ Giao hàng */}
                    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                            <MapPin className="h-5 w-5 mr-2" /> Địa chỉ nhận hàng
                        </h2>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {orderDetail.diaChiNhanHang || "Không có thông tin địa chỉ."}
                        </p>
                    </div>

                    {/* Phương thức Thanh toán */}
                    <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2" /> Thanh toán
                        </h2>
                        <p className="text-sm font-semibold text-gray-700">
                            {orderDetail.phuongThucThanhToan || "Không rõ"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Tổng thanh toán: <span className="text-red-600 font-bold">{orderDetail.tongTien.toLocaleString('vi-VN')} đ</span>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};