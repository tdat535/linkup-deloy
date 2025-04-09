import 'flowbite';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Sun,Moon } from "lucide-react";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',  
        email: '',
        phonenumber: '', 
        password: '',
        confirmPassword: '',
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSun, setIsSun] = useState(true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        if (!formData.username || !formData.email || !formData.phonenumber || !formData.password) {
            setError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
    
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp.');
            return;
        }
    
        setLoading(true);
    
        try {
            console.log("Dữ liệu gửi lên API:", JSON.stringify({
                username: formData.username,
                email: formData.email,
                phone: formData.phonenumber,
                password: formData.password,
            }));
    
            const response = await fetch('https://api-linkup.id.vn/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    phonenumber: formData.phonenumber,  
                }),
            });
            
    
            const result = await response.json();
            console.log("Phản hồi API:", response);
    
            if (response.ok) {
                alert('Đăng ký thành công! Chuyển đến trang đăng nhập.');
                navigate('/login');
            } else {
                setError(result.message || 'Đăng ký thất bại.');
            }
        } catch (error) {
            console.error("Lỗi fetch API:", error);
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex justify-center items-center min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundColor: '#1C1C1D'}}>
            <div className="flex-col md:flex-row w-full bg-opacity-50 p-5">
            <div className='text-7xl text-center break-words text-white'><span className='text-transparent bg-clip-text bg-gradient-to-r to-emerald-300 from-sky-400 '>𝓛𝓲𝓷𝓴𝓤𝓹</span></div>
                <div className="flex justify-center items-center w-full mt-10">
                    <form onSubmit={handleSubmit} className={`max-w-sm mx-auto p-6 border rounded-2xl border-stone-800 w-full bg-opacity-75 ${isSun ? 'shadow-[3px_3px_0px_rgba(100,100,100,0.3)] bg-black' : 'shadow-[3px_3px_0px_rgba(10,10,10,0.5)] bg-white'}`} style={{ maxWidth: '32rem', height: '43rem' }}>
                        <div className='flex relative'>
                            <p className={`text-center font-bold block mb-2 text-2xl ${isSun ? 'text-white' : 'text-black'}`}>Đăng kí</p>
                            <button type='reset'className={`p-1.5 rounded-xl  backdrop-blur-md hover:backdrop-blur-lg absolute right-0 transition-all ${isSun 
                                ? 'bg-[#f9d134] text-black shadow-[0px_0px_30px_5px_rgba(255,255,255,0.5)] hover:shadow-[0px_0px_5px_3px_rgba(255,255,255,0.5)] duration-1000' 
                                : 'bg-[#757271] text-blue-700 duration-1000'}`}  onClick={() => setIsSun(!isSun)}>
                                    {isSun ? <Sun/> : <Moon/>}
                            </button>
                        </div>
                        {<p className='text-red-500 text-sm mb-3'>{error || "ㅤ"}</p>}
                        <div className="mb-3">
                            <label className={`block mb-2 text-sm font-medium ${isSun ? 'text-white' : 'text-black'}`}>Tên tài khoản</label>
                            <input type="text" name="username" className={`text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500 focus:bg-[#e8f0fe] ${isSun ? 'bg-black border border-white text-white placeholder-gray-700' : 'bg-white border border-black text-black placeholder-gray-300'}`} value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className={`block mb-2 text-sm font-medium ${isSun ? 'text-white' : 'text-black'}`}>Số điện thoại</label>
                            <input type="text" name="phonenumber" className={`text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500 focus:bg-[#e8f0fe] ${isSun ? 'bg-black border border-white text-white placeholder-gray-700' : 'bg-white border border-black text-black placeholder-gray-300'}`} value={formData.phonenumber} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className={`block mb-2 text-sm font-medium ${isSun ? 'text-white' : 'text-black'}`}>Email</label>
                            <input type="email" name="email" className={`text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500 focus:bg-[#e8f0fe] ${isSun ? 'bg-black border border-white text-white placeholder-gray-700' : 'bg-white border border-black text-black placeholder-gray-300'}`} value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className={`block mb-2 text-sm font-medium ${isSun ? 'text-white' : 'text-black'}`}>Mật khẩu</label>
                            <input type="password" name="password" className={`text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500 focus:bg-[#e8f0fe] ${isSun ? 'bg-black border border-white text-white placeholder-gray-700' : 'bg-white border border-black text-black placeholder-gray-300'}`} value={formData.password} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className={`block mb-2 text-sm font-medium ${isSun ? 'text-white' : 'text-black'}`}>Nhập lại mật khẩu</label>
                            <input type="password" name="confirmPassword" className={`text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500 focus:bg-[#e8f0fe] ${isSun ? 'bg-black border border-white text-white placeholder-gray-700' : 'bg-white border border-black text-black placeholder-gray-300'}`} value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                        
                        <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2" disabled={loading} onKeyDown={(e) => e.key === "Enter" && Register}>
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>

                        <div className="flex items-center justify-center mt-10">
                            <button onClick={() => navigate('/login')} className="btn-back text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
                                Quay lại trang đăng nhập
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
