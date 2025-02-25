import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/authService';

// יצירת קונטקסט להתחברות מנהל
const AdminAuthContext = createContext(null);

// קומפוננטת ספק ההקשר
export const AdminAuthProvider = ({ children }) => {
  // מצב התחברות
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // בדיקת מצב התחברות בעת טעינת הקומפוננטה
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = AuthService.isAuthenticated();
      setIsAuthenticated(authStatus);
    };

    checkAuthStatus();
  }, []);

  // פונקציית התחברות
  const login = (password) => {
    const result = AuthService.login(password);
    
    if (result.success) {
      setIsAuthenticated(true);
    }
    
    return result;
  };

  // פונקציית התנתקות
  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
  };

  // ערכי ההקשר שיועברו לצאצאים
  const value = {
    isAuthenticated,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook מותאם לשימוש בהקשר האימות
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  
  // בדיקה שההוק נמצא בתוך ספק ההקשר
  if (context === null) {
    throw new Error('useAdminAuth חייב להיות בשימוש בתוך AdminAuthProvider');
  }
  
  return context;
};

export default AdminAuthContext;
