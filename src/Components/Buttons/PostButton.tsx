
import React from 'react';

interface PostButtonProps {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

const PostButton: React.FC<PostButtonProps> = ({ 
    text, 
    onClick, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    fullWidth = false, icon
}) => {
    const baseClasses = "rounded px-4 py-2 flex items-center justify-center transition-all";

    const variantClasses = {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-white text-black hover:bg-gray-400",
    };

    const sizeClasses = {
        sm: "text-sm px-2 py-1",
        md: "text-base px-4 py-2",
        lg: "text-base px-6 py-2 rounded-full",
    };

    //  fullWitdh: true => w-full, false => w-auto
    //  disabled: true => opacity-50 cursor-not-allowed, false => ''
    return (
        <button
          className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
            fullWidth ? "w-full" : "w-auto" 
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={onClick}
          disabled={disabled}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {text}
        </button>
      );
};

export default PostButton;