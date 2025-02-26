import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase';
import AuthService from '../services/authService';

// יצירת קונטקסט להתחברות מנהל
const AdminAuthContext = createContext(null);

// קומפוננטת ספק ההקשר
export const AdminAuthProvider = ({ children }) => {
  // מצבי המשתמש
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // בדיקת מצב התחברות מקומי בעת טעינה
  useEffect(() => {
    const checkLocalAuth = () => {
      const localAuth = localStorage.getItem('isAuthenticated') === 'true';
      const isAdminUser = localStorage.getItem('userRole') === 'admin';
      
      // אם יש אימות מקומי של מנהל, נגדיר משתמש בסיסי
      if (localAuth && isAdminUser) {
        setUser({ 
          uid: 'local-admin',
          email: 'admin@local',
          isLocalAuth: true 
        });
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };

    // בדיקת אימות מקומי כשאין אימות Firebase
    if (!auth.currentUser) {
      checkLocalAuth();
    }

    // בדיקת מצב אימות Firebase
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
            
            // בדיקה אם יש אימות מקומי אחרי התנתקות מ-Firebase
            checkLocalAuth();
          }
        } catch (error) {
          console.error('שגיאה בבדיקת הרשאות מנהל:', error);
          setUser(null);
          setIsAuthenticated(false);
          
          // בדיקה אם יש אימות מקומי במקרה של שגיאה
          checkLocalAuth();
        }
      } else {
        // אין משתמש Firebase - בדיקת אימות מקומי
        checkLocalAuth();
      }
    });
    
    // ניקוי המנוי בעת הסרת הקומפוננטה
    return () => unsubscribe();
  }, []);

  // פונקציית התחברות
  const login = async (email, password) => {
    // אם יש אימות מקומי, נחזיר הצלחה ישירות
    const localAuth = localStorage.getItem('isAuthenticated') === 'true';
    const isAdminUser = localStorage.getItem('userRole') === 'admin';
    
    if (localAuth && isAdminUser) {
      return { 
        success: true,
        user: {
          uid: 'local-admin',
          email: 'admin@local',
          isLocalAuth: true
        }
      };
    }
    
    // אחרת ננסה להתחבר דרך Firebase
    const result = await AuthService.login(email, password);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    
    return result;
  };

  // פונקציית התנתקות
  const logout = async () => {
    // אם זה אימות מקומי, מספיק לנקות את האחסון המקומי
    if (user?.isLocalAuth) {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    
    // אחרת יש להתנתק גם מ-Firebase
    await AuthService.logout();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
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
