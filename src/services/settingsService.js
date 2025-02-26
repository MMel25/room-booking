// src/services/settingsService.js
import { 
  ref, 
  get, 
  set, 
  update,
  push,
  remove
} from "firebase/database";
import { db } from '../firebase';

class SettingsService {
  constructor() {
    this.settingsRef = ref(db, 'settings');
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
        const defaultSettings = this.getDefaultSettings();
        await set(this.settingsRef, defaultSettings);
        
        return {
          success: true,
          settings: defaultSettings
        };
      }
    } catch (error) {
      console.error('שגיאה בשליפת הגדרות:', error);
      return {
        success: false,
        message: 'שגיאה בשליפת הגדרות',
        error
      };
    }
  }

  // הגדרות ברירת מחדל
  getDefaultSettings() {
    return {
      title: 'חדר דיירים בן חור 4',
      accessCode: '4334',
      adminCode: '3266',
      maxBookingHours: 12,
      regulations: 'החדר מוקצה לשימוש פרטי של דיירי הבניין בלבד...',
      updatedAt: new Date().toISOString()
    };
  }

  // עדכון הגדרות מערכת
  async updateSystemSettings(newSettings) {
    try {
      const updatedSettings = {
        ...newSettings,
        updatedAt: new Date().toISOString()
      };
      
      await set(this.settingsRef, updatedSettings);

      return {
        success: true,
        settings: updatedSettings
      };
    } catch (error) {
      console.error('שגיאה בעדכון הגדרות:', error);
      return {
        success: false,
        message: 'שגיאה בעדכון הגדרות',
        error
      };
    }
  }

  // עדכון שדה בודד בהגדרות
  async updateSetting(field, value) {
    try {
      const updates = {};
      updates[field] = value;
      updates['updatedAt'] = new Date().toISOString();
      
      await update(this.settingsRef, updates);
      
      return {
        success: true,
        field,
        value
      };
    } catch (error) {
      console.error(`שגיאה בעדכון שדה ${field}:`, error);
      return {
        success: false,
        message: `שגיאה בעדכון שדה ${field}`,
        error
      };
    }
  }
}

export default new SettingsService();
