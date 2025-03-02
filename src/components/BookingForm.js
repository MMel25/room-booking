import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ChevronRight, Calendar, Clock, CheckCircle } from 'lucide-react';

const BookingForm = ({ 
  onClose, 
  selectedDate, 
  selectedTime, 
  settings, 
  onSubmit,
  isEditMode = false,
  initialData = null
}) => {
  // מדפיס ערכים שהתקבלו לצורך דיבוג
  console.log('BookingForm props received:', { selectedDate, selectedTime, isEditMode });
  
  // חילוץ שעת התחלה מהפרופס או מהמצב הראשוני
  const extractStartTime = () => {
    if (isEditMode && initialData && initialData.startTime) {
      return initialData.startTime;
    }
    
    if (selectedTime) {
      // נסה לחלץ את השעה בכמה דרכים אפשריות
      if (typeof selectedTime === 'string') {
        // אם זה מחרוזת בפורמט של שעה (כמו "14:00")
        if (selectedTime.includes(':')) {
          return selectedTime.split(':')[0];
        }
        // אם זו מחרוזת אבל רק מספר (כמו "14")
        return selectedTime;
      }
      // אם זה מספר
      if (typeof selectedTime === 'number') {
        return selectedTime.toString();
      }
    }
    
    // ברירת מחדל - מחרוזת ריקה
    return '';
  };
  
  // מצב ראשוני של הטופס עם חילוץ שעת התחלה באופן ברור יותר
  const initialStartTime = extractStartTime();
  console.log('Initial start time extracted:', initialStartTime);
  
  const [formData, setFormData] = useState({
    date: selectedDate || '',
    startTime: initialStartTime,
    endTime: '',
    apartment: '',
    name: '',
    phone: '',
    purpose: '',
    acceptTerms: false
  });
  
  // הוספת מצב חדש להצגת הודעת הצלחה
  const [successMessage, setSuccessMessage] = useState("");

  // וידוא שהשעה מעודכנת בכל שינוי
  useEffect(() => {
    console.log('useEffect triggered - props changed:', { selectedDate, selectedTime });
    
    if (isEditMode && initialData) {
      // מדפיס למטרות דיבוג
      console.log('Loading initial data for edit:', initialData);
      
      setFormData(prev => ({
        date: initialData.date || selectedDate || prev.date,
        startTime: initialData.startTime || extractStartTime() || prev.startTime,
        endTime: initialData.endTime || prev.endTime,
        apartment: initialData.apartment || prev.apartment,
        name: initialData.name || prev.name,
        phone: initialData.phone || prev.phone,
        purpose: initialData.purpose || prev.purpose,
        acceptTerms: initialData.acceptTerms || true
      }));
    } else {
      // אם זו הזמנה חדשה - מעדכן אוטומטית את שעת ההתחלה
      const newStartTime = extractStartTime();
      console.log('New booking - setting time to:', newStartTime);
      
      if (newStartTime) {
        setFormData(prev => ({
          ...prev,
          startTime: newStartTime,
          date: selectedDate || prev.date
        }));
      }
    }
  }, [isEditMode, initialData, selectedDate, selectedTime]);

  const apartmentOptions = Array.from({ length: 37 }, (_, i) => i + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // בדיקה שכל השדות מלאים
    if (!formData.apartment || !formData.name || !formData.phone || !formData.purpose || !formData.acceptTerms || !formData.endTime) {
      alert('נא למלא את כל השדות');
      return;
    }
    
    // בדיקה שמשך ההזמנה תקין
    const startHour = parseInt(formData.startTime);
    const endHour = parseInt(formData.endTime);
    if (endHour <= startHour) {
      alert('שעת הסיום חייבת להיות מאוחרת משעת ההתחלה');
      return;
    }
    
    // בדיקת מגבלת שעות רק אם הגדרת maxBookingHours קיימת
    if (settings && settings.maxBookingHours) {
      const duration = endHour - startHour;
      if (duration > settings.maxBookingHours) {
        alert(`לא ניתן להזמין ליותר מ-${settings.maxBookingHours} שעות`);
        return;
      }
    }
    
    // הכנת אובייקט הנתונים לשליחה - וודא שמועברים כערכים מתאימים
    const bookingToSubmit = {
      ...formData,
      // וודא שהשדות הם מהסוג הנכון
      apartment: formData.apartment.toString(),
      startTime: formData.startTime.toString(), 
      endTime: formData.endTime.toString()
    };
    
    // אם זו עריכה, שמר את ה-id המקורי
    if (isEditMode && initialData && initialData.id) {
      bookingToSubmit.id = initialData.id;
    }
    
    console.log('Submitting booking data:', bookingToSubmit);
    
    // שליחת הנתונים לפונקציה החיצונית
    onSubmit(bookingToSubmit);
    
    // הצג הודעת הצלחה
    setSuccessMessage("הזמנתך נקלטה בהצלחה");
    
    // סגור את הטופס אחרי 2 שניות
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
      <div className="max-h-screen overflow-y-auto py-4 px-4 w-full">
        <Card className="w-full max-w-md my-8 mx-auto">
          <CardHeader className="bg-white rounded-t-lg border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium text-amber-800">
                {isEditMode ? 'עריכת הזמנה' : 'הזמנת חדר'}
              </CardTitle>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-amber-50 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-amber-900" />
              </button>
            </div>
            <div className="text-sm text-amber-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formData.date}</span>
              {formData.startTime && (
                <>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{formData.startTime}:00</span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* הודעת הצלחה */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center gap-2 transition-opacity duration-300">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* מספר דירה */}
              <div>
                <label className="block mb-1 text-amber-800">
                  מספר דירה
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.apartment}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">בחר דירה</option>
                  {apartmentOptions.map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {/* שדה תאריך */}
              <div>
                <label className="block mb-1 text-amber-800">
                  תאריך
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* שדה שעת התחלה */}
              <div>
                <label className="block mb-1 text-amber-800">
                  שעת התחלה
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">בחר שעת התחלה</option>
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <option key={hour} value={hour}>{hour}:00</option>
                  ))}
                </select>
              </div>

              {/* שדה שעת סיום */}
              <div>
                <label className="block mb-1 text-amber-800">
                  שעת סיום
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">בחר שעת סיום</option>
                  {Array.from({ length: 24 - parseInt(formData.startTime || 0) }, (_, i) => {
                    const hour = parseInt(formData.startTime || 0) + i + 1;
                    if (hour < 24) {
                      return <option key={hour} value={hour}>{hour}:00</option>;
                    }
                    return null;
                  }).filter(Boolean)}
                </select>
              </div>

              {/* שם מלא */}
              <div>
                <label className="block mb-1 text-amber-800">
                  שם מלא
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* טלפון נייד */}
              <div>
                <label className="block mb-1 text-amber-800">
                  טלפון נייד (מספרים ברצף ללא מקף)
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                  required
                  pattern="05[0-9]{8}"
                  placeholder="05XXXXXXXX"
                />
              </div>

              {/* מטרת השימוש בחדר */}
              <div>
                <label className="block mb-1 text-amber-800">
                  מטרת השימוש בחדר
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* תקנון ואישור */}
              <div className="pt-4 border-t">
                <div className="text-sm text-amber-800 mb-4">
                  תקנון השימוש בחדר:
                  <div className="mt-2 p-3 bg-amber-50 rounded text-black">
                    {settings && settings.regulations ? settings.regulations : 'יש לשמור על ניקיון החדר ולהשאירו במצב תקין.'}
                  </div>
                </div>
                
                <label className="flex items-start gap-2 text-amber-800">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                    required
                    className="mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-right">
                    אני מתחייב/ת לפעול לפי תקנון השימוש בחדר
                    <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* כפתורי פעולה */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 p-2 rounded border border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="flex-1 p-2 rounded text-white bg-amber-600 hover:bg-amber-700"
                >
                  {isEditMode ? 'שמור שינויים' : 'אישור הזמנה'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingForm;
