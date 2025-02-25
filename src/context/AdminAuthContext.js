import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../services/firebase';
import AuthService from '../services/authService';

// יצירת קונטקסט להתחברות מנהל
const AdminAuthContext = createContext(null);

// קומפוננטת ספק ההקשר
export const AdminAuthProvider = ({ children }) => {
  // מצבי המשתמש
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // בדיקת מצב התחברות וטעינת פרטי מנהל
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // בדיקה אם המשתמש הוא מנהל
          const adminRef = ref(db, `admins/${firebaseUser.uid}`);
          const snapshot = await get(adminRef);

          if (snapshot.exists()) {
            setUser(firebaseUser);
            setIsAuthenticated(true);
          } else {
            // משתמש לא מנהל - יש להתנתק
            await AuthService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('שגיאה בבדיקת הרשאות מנהל:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    });

    // ניקוי המנוי בעת הסרת הקומפוננטה
    return () => unsubscribe();
  }, []);

  // פונקציית התחברות
  const login = async (email, password) => {
    const result = await AuthService.login(email, password);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    
    return result;
  };

  // פונקציית התנתקות
  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // ערכי ההקשר שיועברו לצאצאים
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  // מניעת הצגת תוכן לפני סיום בדיקת ההתחברות
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-amber-50">
        <div className="text-amber-900 text-xl">
          טוען...
        </div>
      </div>
    );
  }

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
