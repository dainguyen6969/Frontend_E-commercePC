"use client";

import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import { apiService } from '@/services/api';
import { UserResponse, UserUpdateRequest, DiaChi } from '@/types/Product';
import { Loader2, User, Mail, Phone, MapPin, Edit3, CheckCircle, XCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// --- Interface cho Form Địa chỉ (Frontend) ---
interface AddressForm {
    thanhPho: string;
    xaPhuong: string;
    diaChiHienTai: string;
    phone: string;
}


const UserProfilePage: React.FC = () => {
    const router = useRouter();
    const { isLoggedIn, isLoading: loadingAuth } = useAuth();
    
    const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // State cho Form cập nhật thông tin cá nhân
    const [formData, setFormData] = useState<UserUpdateRequest>({
        email: '',
        fullName: '',
        phone: '',
    });
    
    // State cho Form thêm địa chỉ
    const [newAddress, setNewAddress] = useState<AddressForm>({
        thanhPho: '',
        xaPhuong: '',
        diaChiHienTai: '',
        phone: '',
    });
    
    // --- Fetch User Profile ---
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        try {
            const profile = await apiService.getMyProfile();
            if (profile) {
                setUserProfile(profile);
                setFormData({
                    email: profile.email || '',
                    fullName: profile.fullName || '',
                    phone: profile.phone || '',
                });
            } else {
                router.push('/auth?redirect=/profile');
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            setMessage({ type: 'error', text: 'Không thể tải thông tin hồ sơ.' });
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (!loadingAuth) {
            if (!isLoggedIn) {
                router.push('/auth?redirect=/profile');
            } else {
                fetchProfile();
            }
        }
    }, [loadingAuth, isLoggedIn, router, fetchProfile]);

    // FIX: Sửa lỗi Implicit Any cho form chính
    const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev: UserUpdateRequest) => ({ ...prev, [id]: value }));
    };

    // --- Cập nhật Hồ sơ Chính ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        
        try {
            if (!formData.email || !formData.fullName) {
                 throw new Error("Vui lòng điền đầy đủ Email và Họ tên.");
            }

            const updatedProfile = await apiService.updateMyProfile(formData);
            
            setUserProfile(updatedProfile); 
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });

        } catch (error: any) {
             setMessage({ type: 'error', text: error.message || 'Cập nhật hồ sơ thất bại.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- Xử lý Thêm Địa chỉ ---
    const handleAddAddress = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
        
        try {
            if (!newAddress.thanhPho || !newAddress.diaChiHienTai || !newAddress.phone) {
                 throw new Error("Vui lòng điền đầy đủ thông tin địa chỉ.");
            }

            const updatedProfile = await apiService.addAddress(newAddress); 
            
            // FIX: Cập nhật state userProfile với response mới
            setUserProfile(updatedProfile); 
            setMessage({ type: 'success', text: 'Thêm địa chỉ mới thành công!' });
            setIsAddressModalOpen(false);
            setNewAddress({ thanhPho: '', xaPhuong: '', diaChiHienTai: '', phone: '' });

        } catch (error: any) {
             setMessage({ type: 'error', text: error.message || 'Thêm địa chỉ thất bại.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- Xử lý Xóa Địa chỉ ---
    const handleDeleteAddress = async (id: number, address: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa địa chỉ: ${address}?`)) return;
        
        setIsSubmitting(true);
        setMessage(null);
        try {
            const updatedProfile = await apiService.deleteAddress(id); 
            
            // FIX: Cập nhật state userProfile với response mới
            setUserProfile(updatedProfile); 
            setMessage({ type: 'success', text: 'Đã xóa địa chỉ thành công.' });

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Xóa địa chỉ thất bại.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // FIX: Hàm xử lý thay đổi input trong Modal (Sửa lỗi chỉ nhập 1 ký tự)
    const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        
        setNewAddress((prev: AddressForm) => { 
            // Ánh xạ id của input (modal-thanhPho) sang tên field (thanhPho)
            const fieldName = id.replace('modal-', '') as keyof AddressForm;
            if (fieldName in prev) {
                 return { ...prev, [fieldName]: value };
            }
            return prev;
        });
    }


    // --- Modal Component ---
    const AddressModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-4 border-b pb-2 flex items-center">
                    <MapPin className="h-6 w-6 mr-2" /> Thêm Địa Chỉ Mới
                </h3>
                <form onSubmit={handleAddAddress} className="space-y-4">
                    
                    {/* Phone (Bắt buộc theo Entity mới) */}
                    <div>
                        <label htmlFor="modal-phone" className="block text-sm font-medium text-gray-700">Điện thoại nhận hàng</label>
                        <input
                            id="modal-phone"
                            type="tel"
                            value={newAddress.phone}
                            onChange={handleAddressChange} // Dùng hàm đã FIX
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    {/* Thành phố */}
                    <div>
                        <label htmlFor="modal-thanhPho" className="block text-sm font-medium text-gray-700">Tỉnh/Thành phố</label>
                        <input
                            id="modal-thanhPho" 
                            type="text"
                            value={newAddress.thanhPho}
                            onChange={handleAddressChange} // Dùng hàm đã FIX
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            required
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    {/* Xã/Phường */}
                    <div>
                        <label htmlFor="modal-xaPhuong" className="block text-sm font-medium text-gray-700">Quận/Huyện/Phường/Xã</label>
                        <input
                            id="modal-xaPhuong" 
                            type="text"
                            value={newAddress.xaPhuong}
                            onChange={handleAddressChange} // Dùng hàm đã FIX
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Địa chỉ hiện tại */}
                    <div>
                        <label htmlFor="modal-diaChiHienTai" className="block text-sm font-medium text-gray-700">Địa chỉ cụ thể (Số nhà, Tên đường)</label>
                        <input
                            id="modal-diaChiHienTai" 
                            type="text"
                            value={newAddress.diaChiHienTai}
                            onChange={handleAddressChange} // Dùng hàm đã FIX
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddressModalOpen(false)}
                            className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="py-3 px-6 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Đang lưu...
                                </>
                            ) : 'Lưu Địa Chỉ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );


    if (loadingAuth || (loading && isLoggedIn)) {
        return (
            <div className="container mx-auto p-8 text-center min-h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <span className="ml-3 text-lg text-gray-600">Đang tải hồ sơ người dùng...</span>
            </div>
        );
    }

    if (!isLoggedIn || !userProfile) {
        return null; 
    }

    return (
        <div className="container mx-auto p-4 lg:p-8 max-w-5xl">
            
            {/* Modal Thêm Địa chỉ */}
            {isAddressModalOpen && <AddressModal />}

            <h1 className="text-3xl font-bold mb-8 text-indigo-700 flex items-center">
                <User className="h-7 w-7 mr-3" />
                Cài Đặt Hồ Sơ Cá Nhân
            </h1>

            {/* Message Box */}
            {message && (
                <div className={`p-4 mb-6 rounded-lg shadow-md flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400'}`}>
                    {message.type === 'error' ? <XCircle className="h-5 w-5 mr-3" /> : <CheckCircle className="h-5 w-5 mr-3" />}
                    {message.text}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cột 1: Thông tin cơ bản */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-2xl space-y-4 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Thông tin Đăng nhập</h2>
                    
                    <p className="flex items-center text-gray-700">
                        <User className="h-5 w-5 mr-3 text-indigo-500" />
                        <span className="font-semibold">{userProfile.username}</span>
                    </p>
                    <p className="flex items-center text-gray-700">
                        <Mail className="h-5 w-5 mr-3 text-indigo-500" />
                        <span className="text-sm">{userProfile.email || 'Chưa cập nhật'}</span>
                    </p>
                    <p className="flex items-center text-gray-700">
                        <Phone className="h-5 w-5 mr-3 text-indigo-500" />
                        <span className="text-sm">{userProfile.phone || 'Chưa cập nhật'}</span>
                    </p>
                </div>
                
                {/* Cột 2: Form Cập nhật */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-2xl">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center">
                        <Edit3 className="h-5 w-5 mr-2" /> Cập nhật Hồ sơ
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên</label>
                            <input
                                id="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleFormChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleFormChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 disabled:opacity-50 flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5 mr-2" /> Lưu Thay Đổi
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                {/* Khu vực Quản lý Địa chỉ */}
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-2xl space-y-4">
                     <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" /> Quản lý Địa chỉ
                    </h2>
                    
                    {userProfile.diaChi && userProfile.diaChi.length > 0 ? (
                        userProfile.diaChi.map((diaChi) => (
                            <div key={diaChi.id} className="p-3 border rounded-lg bg-gray-50 flex justify-between items-start">
                                <div className="text-sm">
                                    <p className="font-medium text-gray-800">{diaChi.diaChiHienTai}</p>
                                    <p className="text-gray-600 text-xs">{diaChi.xaPhuong ? `${diaChi.xaPhuong}, ` : ''}{diaChi.thanhPho}</p>
                                    <p className="text-gray-600 text-xs">SĐT: {diaChi.phone}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteAddress(diaChi.id, diaChi.diaChiHienTai)}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded-full transition disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">Chưa có địa chỉ nào được lưu.</p>
                    )}
                    
                    <button 
                        className="text-indigo-600 hover:underline font-medium text-sm pt-2 flex items-center" 
                        onClick={() => setIsAddressModalOpen(true)}
                        disabled={isSubmitting}
                    >
                        <PlusCircle className='h-4 w-4 mr-1' /> Thêm địa chỉ mới
                    </button>
                </div>

            </div>
        </div>
    );
};

export default UserProfilePage;