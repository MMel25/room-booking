import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Settings, Key, Clock, FileText, Type } from 'lucide-react';

const SystemSettings = ({ initialSettings, onUpdateSettings }) => {
  // מצב ראשוני של טופס ההגדרות
  const [settings, setSettings] = useState({
    title: 'חדר דיירים',
    accessCode: '',
    adminCode: '',
    maxBookingHours: 12,
    regulations: ''
  });
  
  const [confirmAccessCode, setConfirmAccessCode] = useState('');
  const [confirmAdminCode, setConfirmAdminCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // עדכון המצב הראשוני מהפרופס
  useEffect(() => {
    if (initialSettings) {
      setSettings({
        title: initialSettings.title || 'חדר דיירים',
        accessCode: initialSettings.accessCode || '',
        adminCode: initialSettings.adminCode || '',
        maxBookingHours: initialSettings.maxBookingHours || 12,
        regulations: initialSettings.regulations || ''
      });
    }
  }, [initialSettings]);

  // בדיקת תקינות השדות
  const validateForm = () => {
    const newErrors = {};
    
    // בדיקת כותרת
    if (!settings.title.trim()) {
      newErrors.title = 'נא להזין כותרת';
    }
    
    // בדיקת קוד כניסה
    if (!settings.accessCode) {
      newErrors.accessCode = 'נא להזין קוד כניסה';
    } else if (settings.accessCode !== confirmAccessCode) {
      newErrors.confirmAccessCode = 'קודי הכניסה אינם תואמים';
    }
    
    // בדיקת קוד מנהל
    if (!settings.adminCode) {
      newErrors.adminCode = 'נא להזין קוד מנהל';
    } else if (settings.adminCode !== confirmAdminCode) {
      newErrors.confirmAdminCode = 'קודי המנהל אינם תואמים';
    }
    
    // בדיקת מגבלת שעות
    if (!settings.maxBookingHours || settings.maxBookingHours < 1) {
      newErrors.maxBookingHours = 'נא להזין ערך חוקי (לפחות 1)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // טיפול בשמירת הגדרות
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    
    // בדיקת תקינות
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    try {
      // שליחת ההגדרות המעודכנות
      await onUpdateSettings(settings);
      setSaveSuccess(true);
      
      // איפוס ההודעה אחרי 3 שניות
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('שגיאה בשמירת הגדרות:', error);
      setErrors({ submit: 'אירעה שגיאה בשמירת ההגדרות' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4" dir="rtl">
      <Card>
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            הגדרות מערכת
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {saveSuccess && (
            <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
              ההגדרות נשמרו בהצלחה!
            </div>
          )}
          
          {errors.submit && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* כותרת המערכת */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <Type className="w-5 h-5" />
                כותרת המערכת
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="title" className="block mb-1 text-amber-700">
                    כותרת המוצגת במסך הכניסה וביומן
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={settings.title}
                    onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                    className={`w-full p-2 rounded border ${errors.title ? 'border-red-300' : 'border-amber-200'} 
                                bg-white focus:outline-none focus:border-amber-500`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-red-500 text-sm">{errors.title}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* קודי כניסה */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                קודי כניסה
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accessCode" className="block mb-1 text-amber-700">
                      קוד כניסה למשתמשים רגילים
                    </label>
                    <input
                      type="text"
                      id="accessCode"
                      value={settings.accessCode}
                      onChange={(e) => setSettings({ ...settings, accessCode: e.target.value })}
                      className={`w-full p-2 rounded border ${errors.accessCode ? 'border-red-300' : 'border-amber-200'} 
                                  bg-white focus:outline-none focus:border-amber-500`}
                      placeholder="לדוגמה: 4334"
                    />
                    {errors.accessCode && (
                      <p className="mt-1 text-red-500 text-sm">{errors.accessCode}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmAccessCode" className="block mb-1 text-amber-700">
                      אימות קוד כניסה
                    </label>
                    <input
                      type="text"
                      id="confirmAccessCode"
                      value={confirmAccessCode}
                      onChange={(e) => setConfirmAccessCode(e.target.value)}
                      className={`w-full p-2 rounded border ${errors.confirmAccessCode ? 'border-red-300' : 'border-amber-200'} 
                                  bg-white focus:outline-none focus:border-amber-500`}
                      placeholder="הזן שוב את קוד הכניסה"
                    />
                    {errors.confirmAccessCode && (
                      <p className="mt-1 text-red-500 text-sm">{errors.confirmAccessCode}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="adminCode" className="block mb-1 text-amber-700">
                      קוד כניסה למנהלים
                    </label>
                    <input
                      type="text"
                      id="adminCode"
                      value={settings.adminCode}
                      onChange={(e) => setSettings({ ...settings, adminCode: e.target.value })}
                      className={`w-full p-2 rounded border ${errors.adminCode ? 'border-red-300' : 'border-amber-200'} 
                                  bg-white focus:outline-none focus:border-amber-500`}
                      placeholder="לדוגמה: 3266"
                    />
                    {errors.adminCode && (
                      <p className="mt-1 text-red-500 text-sm">{errors.adminCode}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirmAdminCode" className="block mb-1 text-amber-700">
                      אימות קוד מנהל
                    </label>
                    <input
                      type="text"
                      id="confirmAdminCode"
                      value={confirmAdminCode}
                      onChange={(e) => setConfirmAdminCode(e.target.value)}
                      className={`w-full p-2 rounded border ${errors.confirmAdminCode ? 'border-red-300' : 'border-amber-200'} 
                                  bg-white focus:outline-none focus:border-amber-500`}
                      placeholder="הזן שוב את קוד המנהל"
                    />
                    {errors.confirmAdminCode && (
                      <p className="mt-1 text-red-500 text-sm">{errors.confirmAdminCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* הגבלות הזמנה */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                הגבלות הזמנה
              </h3>
              <div>
                <label htmlFor="maxBookingHours" className="block mb-1 text-amber-700">
                  מספר שעות מקסימלי להזמנה אחת
                </label>
                <input
                  type="number"
                  id="maxBookingHours"
                  min="1"
                  max="24"
                  value={settings.maxBookingHours}
                  onChange={(e) => setSettings({ ...settings, maxBookingHours: parseInt(e.target.value) || 1 })}
                  className={`w-full p-2 rounded border ${errors.maxBookingHours ? 'border-red-300' : 'border-amber-200'} 
                              bg-white focus:outline-none focus:border-amber-500`}
                />
                {errors.maxBookingHours && (
                  <p className="mt-1 text-red-500 text-sm">{errors.maxBookingHours}</p>
                )}
              </div>
            </div>
            
            {/* תקנון */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                תקנון השימוש
              </h3>
              <div>
                <label htmlFor="regulations" className="block mb-1 text-amber-700">
                  תקנון השימוש בחדר
                </label>
                <textarea
                  id="regulations"
                  value={settings.regulations}
                  onChange={(e) => setSettings({ ...settings, regulations: e.target.value })}
                  className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500 min-h-[150px]"
                  placeholder="הזן את תקנון השימוש בחדר..."
                />
              </div>
            </div>
            
            {/* כפתור שמירה */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`px-6 py-2 text-white rounded-md ${
                  isSaving ? 'bg-amber-400' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isSaving ? 'שומר...' : 'שמור הגדרות'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
