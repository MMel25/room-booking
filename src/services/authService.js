// src/services/authService.js
import { 
  ref, 
  get, 
  set 
} from "firebase/database";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  getAuth
} from "firebase/auth";
import { db } from '../firebase';

class AuthService {
  constructor() {
    this.auth = getAuth();
  }

  // התחברות למנהל
  async login(email, password) {
    try {
      // אימות מול Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      
      // בדיקה אם המשתמש הוא מנהל
      const adminRef = ref(db, `admins/${userCredential.user.uid}`);
      const snapshot = await get(adminRef);
      
      if (!snapshot.exists()) {
        // התנתקות אם המשתמש אינו מנהל
        await signOut(this.auth);
        return {
          success: false,
          message: 'אין הרשאת מנהל'
        };
      }
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // יצירת משתמש מנהל חדש
  async createAdminUser(email, password, adminDetails) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      
      // שמירת פרטי מנהל במסד הנתונים
      const adminRef = ref(db, `admins/${userCredential.user.uid}`);
      await set(adminRef, {
        email: userCredential.user.email,
        ...adminDetails,
        createdAt: new Date().toISOString()
      });
      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // התנתקות
  async logout() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: this.getErrorMessage(error.code) 
      };
    }
  }

  // תרגום קודי שגיאה של Firebase
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/invalid-email': 'כתובת אימייל לא תקינה',
      'auth/user-disabled': 'המשתמש נחסם',
      'auth/user-not-found': 'משתמש לא נמצא',
      'auth/wrong-password': 'סיסמה שגויה',
      'auth/email-already-in-use': 'האימייל כבר בשימוש',
      'auth/weak-password': 'הסיסמה חלשה מדי',
      'default': 'אירעה שגיאה. אנא נסה שוב'
    };
    return errorMessages[errorCode] || errorMessages['default'];
  }

  // בדיקת סטטוס התחברות
  isAuthenticated() {
    return !!this.auth.currentUser;
  }

  // שליפת המשתמש הנוכחי
  getCurrentUser() {
    return this.auth.currentUser;
  }
}

export default new AuthService();
