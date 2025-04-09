// Đây là một component Modal đơn giản, nhận các props isOpen, 
// onClose, title, content và footer.

import React from "react";
import { useTheme } from '../../../context/ThemeContext';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
}
// isOpen: boolean - xác định xem modal có hiển thị hay không
// onClose: () => void - hàm được gọi khi người dùng đóng modal
// title: string - tiêu đề của modal
// content: React.ReactNode - nội dung của modal
// footer?: React.ReactNode - phần footer của modal, có thể không có


const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, content, footer }) => {
    if (!isOpen) return null; // Không render nếu modal không mở
    const { theme } = useTheme();
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Overlay làm tối nền */}
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
  
        {/* Hộp thoại modal */}
        <div className={` p-4 rounded-lg shadow-lg w-150 z-50 relative ${theme === 'dark' ? 'bg-[#252728]' : 'bg-white'}`}>
          <div className="flex justify-between items-center border-b border-[#626466] pb-2">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-red-500">✖</button>
          </div>
  
          {/* Nội dung */}
          <div className="py-3">{content}</div>
  
          {/* Footer */}
          {footer && <div className="border-t border-[#626466] pt-2 mt-2">{footer}</div>}
        </div>
      </div>
    );
  };
    
export default Modal;
