// settingsService.js

class SettingsService {
  constructor() {
    // אתחול הגדרות ברירת מחדל אם לא קיימות
    this.initializeDefaultSettings();
  }

  // אתחול הגדרות ברירת מחדל
  initializeDefaultSettings() {
    const defaultSettings = {
      apartments: [
        { 
          id: 1, 
          name: 'דירה 1', 
          maxGuests: 4, 
          pricePerNight: 350 
        },
        { 
          id: 2, 
          name: 'דירה 2', 
          maxGuests: 6, 
          pricePerNight: 450 
        }
      ],
      systemSettings: {
        adminPassword: 'admin123', // סיסמת מנהל ראשונית
        automaticConfirmation: false,
        maxBookingDuration: 7, // מספר ימים מקסימלי להזמנה
        notificationEmail: '', // אימייל לקבלת התראות
      },
      bookingRules: {
        advanceBookingDays: 30, // מספר ימים מראש שניתן להזמין
        cancellationPolicy: {
          freeCancellationDays: 3, // ימים שניתן לבטל ללא עלות
          cancellationFee: 50 // עלות ביטול לאחר התקופה הנ"ל
        }
      }
    };

    // אם אין הגדרות ב-localStorage, יצירת הגדרות ברירת מחדל
    if (!localStorage.getItem('systemSettings')) {
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
    }
  }

  // שליפת כל ההגדרות
  getSettings() {
    const settings = localStorage.getItem('systemSettings');
    return settings ? JSON.parse(settings) : null;
  }

  // עדכון הגדרות כלליות
  updateSystemSettings(newSettings) {
    const currentSettings = this.getSettings();
    
    // מיזוג ההגדרות החדשות עם ההגדרות הקיימות
    const updatedSettings = {
      ...currentSettings,
      systemSettings: {
        ...currentSettings.systemSettings,
        ...newSettings
      }
    };

    localStorage.setItem('systemSettings', JSON.stringify(updatedSettings));
    return {
      success: true,
      settings: updatedSettings
    };
  }

  // ניהול דירות - הוספת דירה
  addApartment(apartmentData) {
    const settings = this.getSettings();
    
    // בדיקה אם קיימת דירה עם אותו מזהה
    const isDuplicateId = settings.apartments.some(
      apt => apt.id === apartmentData.id
    );

    if (isDuplicateId) {
      return {
        success: false,
        message: 'קיימת דירה עם מזהה זהה'
      };
    }

    settings.apartments.push(apartmentData);
    localStorage.setItem('systemSettings', JSON.stringify(settings));

    return {
      success: true,
      apartment: apartmentData
    };
  }

  // ניהול דירות - עדכון דירה
  updateApartment(apartmentId, updatedData) {
    const settings = this.getSettings();
    const apartmentIndex = settings.apartments.findIndex(
      apt => apt.id === apartmentId
    );

    if (apartmentIndex === -1) {
      return {
        success: false,
        message: 'דירה לא נמצאה'
      };
    }

    // עדכון פרטי הדירה
    settings.apartments[apartmentIndex] = {
      ...settings.apartments[apartmentIndex],
      ...updatedData
    };

    localStorage.setItem('systemSettings', JSON.stringify(settings));

    return {
      success: true,
      apartment: settings.apartments[apartmentIndex]
    };
  }

  // ניהול דירות - מחיקת דירה
  deleteApartment(apartmentId) {
    const settings = this.getSettings();
    const originalLength = settings.apartments.length;
    
    // סינון הדירות ללא הדירה המבוקשת
    settings.apartments = settings.apartments.filter(
      apt => apt.id !== apartmentId
    );

    // בדיקה אם נמחקה דירה
    if (settings.apartments.length === originalLength) {
      return {
        success: false,
        message: 'דירה לא נמצאה'
      };
    }

    localStorage.setItem('systemSettings', JSON.stringify(settings));

    return {
      success: true
    };
  }

  // שינוי סיסמת מנהל
  changeAdminPassword(currentPassword, newPassword) {
    const settings = this.getSettings();

    // בדיקת סיסמה נוכחית
    if (settings.systemSettings.adminPassword !== currentPassword) {
      return {
        success: false,
        message: 'סיסמה נוכחית שגויה'
      };
    }

    // עדכון סיסמה
    settings.systemSettings.adminPassword = newPassword;
    localStorage.setItem('systemSettings', JSON.stringify(settings));

    return {
      success: true
    };
  }
}

// יצירת סינגלטון
export default new SettingsService();
