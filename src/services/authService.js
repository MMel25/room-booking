// src/services/authService.js
import { ref, get } from "firebase/database";
import { db } from '../firebase';

class AuthService {
  constructor() {
    this.isLoggedIn = false;
    this.userRole = null;
  }

  // התחברות למערכת
  async login(code, isAdminLogin = false) {
    try {
      // המרה למספר במקרה שהקוד הוכנס כמחרוזת
      const numericCode = Number(code);
      
      // שליפת הגדרות מהפיירבייס
      const settingsRef = ref(db, 'settings');
      const snapshot = await get(settingsRef);
      
      if (!snapshot.exists()) {
        return {
          success: false,
          message: 'לא נמצאו הגדרות מערכת'
        };
      }

      const settings = snapshot.val();
      
      // בדיקה האם זה ניסיון התחברות לממשק ניהול
      if (isAdminLogin) {
        if (numericCode === settings.adminCode) {
          this.isLoggedIn = true;
          this.userRole = 'admin';
          return {
            success: true,
            role: 'admin'
          };
        } else {
          return {
            success: false,
            message: 'קוד מנהל שגוי'
          };
        }
      } 
      // התחברות משתמש רגיל
      else {
        if (numericCode === settings.accessCode) {
          this.isLoggedIn = true;
          this.userRole = 'user';
          return {
            success: true,
            role: 'user'
          };
        } else {
          return {
            success: false,
            message: 'קוד כניסה שגוי'
          };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'אירעה שגיאה. אנא נסה שוב'
      };
    }
  }

  // התנתקות מהמערכת
  logout() {
    this.isLoggedIn = false;
    this.userRole = null;
    return { success: true };
  }

  // בדיקת סטטוס התחברות
  isAuthenticated() {
    return this.isLoggedIn;
  }

  // שליפת תפקיד המשתמש הנוכחי
  getUserRole() {
    return this.userRole;
  }

  // בדיקה האם המשתמש הוא מנהל
  isAdmin() {
    return this.userRole === 'admin';
  }
}

export default new AuthService();
