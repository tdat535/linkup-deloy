// UserContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  // ⏱ Cập nhật lại user nếu localStorage thay đổi bên ngoài
  useEffect(() => {
    const handleStorageChange = () => {
      const newUser = localStorage.getItem("user");
      if (newUser) {
        setUser(JSON.parse(newUser));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
