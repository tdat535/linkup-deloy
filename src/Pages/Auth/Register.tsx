import 'flowbite';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

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
    const [isDarkMode, setIsDarkMode] = useState(false);

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
                phonenumber: formData.phonenumber,
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
        <div
            className={`flex flex-col md:flex-row items-center justify-center h-screen w-screen overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
                }`}
        >
            {/* Logo chỉ hiển thị trên điện thoại */}
            <div className="md:hidden text-center w-full py-2.5 bg-blue-500 text-white text-2xl font-bold">
                <span className='text-transparent text-2xl bg-clip-text bg-gradient-to-t to-emerald-300 via-sky-300 from-sky-400'>𝓛𝓲𝓷𝓴𝓤𝓹</span> - Kết nối bạn bè
            </div>

            {/* Container chính */}
            <div className="w-full max-w-5xl md:flex bg-white dark:bg-gray-800 shadow-lg overflow-hidden h-full md:h-auto">

                {/* Cột trái - Giới thiệu mạng xã hội (Ẩn trên mobile) */}
                <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10 bg-blue-500 text-white">
                    <div className='text-7xl text-center break-words text-white'>
                        <span className='text-transparent bg-clip-text bg-gradient-to-t to-emerald-300 via-sky-300 from-sky-400 drop-shadow-lg'>𝓛𝓲𝓷𝓴𝓤𝓹</span>
                    </div>
                    <p className="text-lg mt-3">Tham gia cộng đồng của chúng tôi ngay hôm nay để chia sẻ và kết nối.</p>
                </div>

                {/* Cột phải - Form đăng ký */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Đăng ký</h1>
                        <button
                            className="p-3 rounded-xl bg-yellow-400 dark:bg-gray-700 text-gray-900 dark:text-white shadow-md hover:shadow-lg transition-all"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                        >
                            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                    </div>

                    {/* Thông báo lỗi */}
                    {error && <p className="text-red-500 text-sm mb-3 text-center bg-red-100 dark:bg-red-700 p-2 rounded-lg">{error}</p>}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <InputField label="Tên tài khoản" name="username" value={formData.username} onChange={handleChange} />
                        <InputField label="Số điện thoại" name="phonenumber" value={formData.phonenumber} onChange={handleChange} />
                        <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
                        <InputField label="Mật khẩu" type="password" name="password" value={formData.password} onChange={handleChange} />
                        <InputField label="Nhập lại mật khẩu" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold 
                            transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? '⏳ Đang đăng ký...' : 'Đăng ký ngay'}
                        </button>

                        {/* Back to Login */}
                        <button
                            type="button"
                            className="w-full mt-2 text-center text-blue-600 dark:text-blue-300 hover:underline transition-all"
                            onClick={() => navigate('/login')}
                        >
                            ⬅️ Đã có tài khoản? Đăng nhập ngay
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

/* Component InputField */
const InputField = ({ label, name, type = 'text', value, onChange }: any) => {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required
                className="w-full p-3 mt-1 outline-none border border-blue-500 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 
                dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
            />
        </div>
    );
};

export default Register;