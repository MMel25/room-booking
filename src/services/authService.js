// authService.js
import { v4 as uuidv4 } from 'uuid';

class AuthService {
  // שחזור מצב ההתחברות מ-localStorage
  isAuthenticated() {
    const token = localStorage.getItem('adminToken');
    const tokenExpiry = localStorage.getItem('adminTokenExpiry');
    
    // בדיקה אם קיים טוקן ואם הוא לא פג תוקף
    return token && tokenExpiry && new Date(tokenExpiry) > new Date();
  }

  // פונקציית התחברות
  login(password) {
    // כאן תוסיף אימות מול מסד נתונים או שירות אימות חיצוני
    const ADMIN_PASSWORD = 'admin123'; // החלף בהגדרה מאובטחת יותר

    if (password === ADMIN_PASSWORD) {
      // יצירת טוקן ייחודי
      const token = uuidv4();
      
      // קביעת זמן תפוגה של 1 שעה
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      // שמירת הטוקן ב-localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminTokenExpiry', tokenExpiry.toISOString());

      return {
        success: true,
        token: token
      };
    }

    return {
      success: false,
      message: 'סיסמה שגויה'
    };
  }

  // פונקציית התנתקות
  logout() {
    // מחיקת הטוקן מ-localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminTokenExpiry');
  }

  // פונקציה לחילוץ הטוקן הנוכחי
  getToken() {
    return localStorage.getItem('adminToken');
  }
}

// יצירת סינגלטון
export default new AuthService();
