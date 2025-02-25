// src/services/settingsService.js
import { 
  ref, 
  get, 
  set, 
  update,
  push,
  remove
} from "firebase/database";
import { db } from './firebase';

class SettingsService {
  constructor() {
    this.settingsRef = ref(db, 'system/settings');
    this.apartmentsRef = ref(db, 'apartments');
  }

  // שליפת הגדרות מערכת
  async getSettings() {
    try {
      const snapshot = await get(this.settingsRef);
      
      if (snapshot.exists()) {
        return {
          success: true,
          settings: snapshot.val()
        };
      } else {
        // יצירת הגדרות ברירת מחדל אם לא קיימות
        await this.initializeDefaultSettings();
        
        return {
          success: true,
          settings: this.getDefaultSettings()
        };
      }
    } catch (error) {
      console.error('שגיאה בשליפת הגדרות:', error);
      return {
        success: false,
        message: 'שגיאה בשליפת הגדרות'
      };
    }
  }

  // הגדרות ברירת מחדל
  getDefaultSettings() {
    return {
      systemSettings: {
        automaticConfirmation: false,
        maxBookingDuration: 7,
        notificationEmail: '',
        cancellationPolicy: {
          freeCancellationDays: 3,
          cancellationFee: 50
        }
      }
    };
  }

  // אתחול הגדרות ברירת מחדל
  async initializeDefaultSettings() {
    try {
      await set(this.settingsRef, this.getDefaultSettings());
    } catch (error) {
      console.error('שגיאה באתחול הגדרות:', error);
    }
  }

  // עדכון הגדרות מערכת
  async updateSystemSettings(newSettings) {
    try {
      await update(this.settingsRef, {
        systemSettings: newSettings,
        updatedAt: new Date().toISOString()
      });

      return {
        success: true,
        settings: newSettings
      };
    } catch (error) {
      console.error('שגיאה בעדכון הגדרות:', error);
      return {
        success: false,
        message: 'שגיאה בעדכון הגדרות'
      };
    }
  }

  // שליפת כל הדירות
  async getApartments() {
    try {
      const snapshot = await get(this.apartmentsRef);
      let apartments = [];

      if (snapshot.exists()) {
        apartments = Object.entries(snapshot.val()).map(([id, apartment]) => ({
          id,
          ...apartment
        }));
      }

      return {
        success: true,
        apartments: apartments
      };
    } catch (error) {
      console.error('שגיאה בשליפת דירות:', error);
      return {
        success: false,
        message: 'שגיאה בשליפת דירות'
      };
    }
  }

  // הוספת דירה
  async addApartment(apartmentData) {
    try {
      const newApartmentRef = push(this.apartmentsRef);
      const newApartment = {
        ...apartmentData,
        id: newApartmentRef.key,
        createdAt: new Date().toISOString()
      };

      await set(newApartmentRef, newApartment);

      return {
        success: true,
        apartment: newApartment
      };
    } catch (error) {
      console.error('שגיאה בהוספת דירה:', error);
      return {
        success: false,
        message: 'שגיאה בהוספת דירה'
      };
    }
  }

  // עדכון דירה
  async updateApartment(apartmentId, updatedData) {
    try {
      const apartmentRef = ref(db, `apartments/${apartmentId}`);
      
      const updatedApartment = {
        ...updatedData,
        id: apartmentId,
        updatedAt: new Date().toISOString()
      };

      await set(apartmentRef, updatedApartment);

      return {
        success: true,
        apartment: updatedApartment
      };
    } catch (error) {
      console.error('שגיאה בעדכון דירה:', error);
      return {
        success: false,
        message: 'שגיאה בעדכון דירה'
      };
    }
  }

  // מחיקת דירה
  async deleteApartment(apartmentId) {
    try {
      const apartmentRef = ref(db, `apartments/${apartmentId}`);
      await remove(apartmentRef);

      return {
        success: true
      };
    } catch (error) {
      console.error('שגיאה במחיקת דירה:', error);
      return {
        success: false,
        message: 'שגיאה במחיקת דירה'
      };
    }
  }
}

export default new SettingsService();
