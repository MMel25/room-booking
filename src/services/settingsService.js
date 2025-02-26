// src/services/settingsService.js
import { 
  ref, 
  get, 
  set, 
  update
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
        console.log('Loaded settings from Firebase');
        return {
          success: true,
          settings: snapshot.val()
        };
      } else {
        console.log('No settings found, creating defaults');
        const defaultSettings = this.getDefaultSettings();
        await set(this.settingsRef, defaultSettings);
        
        return {
          success: true,
          settings: defaultSettings
        };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        success: false,
        message: 'שגיאה בשליפת הגדרות',
        error
      };
    }
  }

  // הגדרות ברירת מחדל - עם ערכים זמניים בלבד
  getDefaultSettings() {
    return {
      title: 'חדר דיירים',
      accessCode: '0000',        // קוד זמני - יש לעדכן בממשק הניהול
      adminCode: '1234',         // קוד זמני - יש לעדכן בממשק הניהול
      maxBookingHours: 12,
      regulations: 'יש לשמור על ניקיון החדר ולהשאיר אותו במצב תקין.',
      updatedAt: new Date().toISOString()
    };
  }

  // עדכון הגדרות מערכת
  async updateSystemSettings(newSettings) {
    try {
      console.log('Updating settings');
      
      // וידוא שהשדות הם מהסוג הנכון
      const updatedSettings = {
        title: newSettings.title || 'חדר דיירים',
        accessCode: newSettings.accessCode || '',
        adminCode: newSettings.adminCode || '',
        maxBookingHours: parseInt(newSettings.maxBookingHours) || 12,
        regulations: newSettings.regulations || '',
        updatedAt: new Date().toISOString()
      };
      
      // שמירה לפיירבייס
      await set(this.settingsRef, updatedSettings);
      
      console.log('Settings updated successfully');
      return {
        success: true,
        settings: updatedSettings
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      return {
        success: false,
        message: 'שגיאה בעדכון הגדרות',
        error: error.message
      };
    }
  }

  // עדכון שדה בודד בהגדרות
  async updateSetting(field, value) {
    try {
      const updates = {};
      updates[field] = value;
      updates['updatedAt'] = new Date().toISOString();
      
      console.log(`Updating setting ${field}`);
      await update(this.settingsRef, updates);
      
      return {
        success: true,
        field,
        value
      };
    } catch (error) {
      console.error(`Error updating setting ${field}:`, error);
      return {
        success: false,
        message: `שגיאה בעדכון שדה ${field}`,
        error: error.message
      };
    }
  }
}

export default new SettingsService();
