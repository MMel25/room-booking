import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Calendar, LogOut, User, Phone, ClipboardList } from 'lucide-react';

import BookingManagement from './BookingManagement';
import SystemSettings from './SystemSettings';
import BookingForm from './BookingForm';
import CalendarView from './CalendarView';
import BookingService from '../services/bookingService';
import SettingsService from '../services/settingsService';

const AdminDashboard = ({ bookings: initialBookings, settings, onLogout }) => {
  // שימוש בהוקים
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  // מצבי הקומפוננטה
  const [activeView, setActiveView] = useState('dashboard');
  const [bookings, setBookings] = useState(initialBookings || []);
  const [systemSettings, setSystemSettings] = useState(settings || {
    title: 'חדר דיירים',
    accessCode: '',
    adminCode: '',
    maxBookingHours: 12,
    regulations: 'יש לשמור על ניקיון החדר...'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [selectedDateForBooking, setSelectedDateForBooking] = useState(null);

  // טעינת נתונים ראשונית אם לא התקבלו מלמעלה
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // טעינת הזמנות אם לא התקבלו מלמעלה
        if (!initialBookings || initialBookings.length === 0) {
          const bookingsResult = await BookingService.getBookings();
          if (bookingsResult.success) {
            setBookings(bookingsResult.bookings);
          }
        }
        
        // טעינת הגדרות אם לא התקבלו מלמעלה
        if (!settings) {
          const settingsResult = await SettingsService.getSettings();
          if (settingsResult.success) {
            setSystemSettings(settingsResult.settings);
          }
        }
      } catch (error) {
        console.error('שגיאה בטעינת נתונים:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [initialBookings, settings]);

  // פונקציות ניהול הזמנות (נשארו כמו קודם)
  const handleDeleteBooking = async (bookingToDelete) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await BookingService.deleteBooking(bookingToDelete.id);
      setIsLoading(false);
      
      if (result.success) {
        setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
      } else {
        alert('שגיאה במחיקת ההזמנה: ' + (result.message || 'אירעה שגיאה'));
      }
    } catch (error) {
      console.error('שגיאה במחיקת הזמנה:', error);
      alert('שגיאה במחיקת ההזמנה');
      setIsLoading(false);
    }
  };

  const handleEditBooking = (bookingToEdit) => {
    setBookingToEdit(bookingToEdit);
    setShowBookingForm(true);
  };

  const handleBookingFormSubmit = async (updatedBookingData) => {
    try {
      setIsLoading(true);
      let result;
      
      if (bookingToEdit) {
        // עדכון הזמנה קיימת
        result = await BookingService.updateBooking(bookingToEdit.id, updatedBookingData);
      } else {
        // הוספת הזמנה חדשה
        result = await BookingService.addBooking(updatedBookingData);
      }
      
      setIsLoading(false);
      
      if (result.success) {
        // עדכון הרשימה המקומית
        if (bookingToEdit) {
          setBookings(bookings.map(b => 
            b.id === bookingToEdit.id ? result.booking : b
          ));
        } else {
          setBookings([...bookings, result.booking]);
        }
        
        setShowBookingForm(false);
        setBookingToEdit(null);
      } else {
        alert(result.message || 'שגיאה בשמירת ההזמנה');
      }
    } catch (error) {
      console.error('שגיאה בשמירת הזמנה:', error);
      alert('שגיאה בשמירת ההזמנה');
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      setIsLoading(true);
      const result = await SettingsService.updateSystemSettings(newSettings);
      setIsLoading(false);
      
      if (result.success) {
        setSystemSettings(newSettings);
        alert('ההגדרות נשמרו בהצלחה');
      } else {
        alert('שגיאה בשמירת ההגדרות: ' + (result.message || 'אירעה שגיאה'));
      }
    } catch (error) {
      console.error('שגיאה בעדכון הגדרות:', error);
      alert('שגיאה בעדכון ההגדרות');
      setIsLoading(false);
    }
  };

  // פונקציית התנתקות
  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout(); // קריאה לפונקציית ההתנתקות שהתקבלה מלמעלה
    navigate('/access');
  };

  // פונקציות לפתיחת טופס הזמנה מהיומן
  const handleTimeSelect = (date, time) => {
    setSelectedDateForBooking({ date, time });
    setShowBookingForm(true);
  };

  const handleQuickBooking = (date, time) => {
    setSelectedDateForBooking({ date, time });
    setShowBookingForm(true);
  };

  // קיים קוד קודם של getStatistics ו-getHebrewDayName 

  // רינדור תפריט צד - עם הוספת תפריט יומן חדש
  const renderSidebar = () => {
    const menuItems = [
      { 
        key: 'dashboard', 
        label: 'לוח בקרה', 
        icon: <Home className="w-5 h-5" /> 
      },
      { 
        key: 'bookings', 
        label: 'ניהול הזמנות', 
        icon: <Calendar className="w-5 h-5" /> 
      },
      { 
        key: 'calendar', 
        label: 'יומן הזמנות', 
        icon: <ClipboardList className="w-5 h-5" /> 
      },
      { 
        key: 'settings', 
        label: 'הגדרות מערכת', 
        icon: <Settings className="w-5 h-5" /> 
      }
    ];

    return (
      <div className="w-64 bg-amber-50 p-4 border-l" dir="rtl">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-amber-900">
            ממשק ניהול
          </h2>
          <p className="text-sm text-amber-700">
            {user?.email || "מנהל מערכת"}
          </p>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={`w-full flex items-center p-3 mb-2 rounded 
              ${activeView === item.key 
                ? 'bg-amber-200 text-amber-900' 
                : 'hover:bg-amber-100'}`}
          >
            <span className="ml-2">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 mt-4 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          <LogOut className="w-5 h-5 ml-2" />
          התנתק
        </button>
      </div>
    );
  };

  // רינדור תצוגת התוכן המרכזית - עם הוספת תצוגת יומן
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-amber-900">טוען נתונים...</p>
        </div>
      );
    }

    switch(activeView) {
      case 'bookings':
        return (
          <BookingManagement 
            bookings={bookings}
            onDeleteBooking={handleDeleteBooking}
            onEditBooking={handleEditBooking}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            bookings={bookings}
            onTimeSelect={handleTimeSelect}
            onQuickBooking={handleQuickBooking}
            settings={systemSettings}
          />
        );
      case 'settings':
        return (
          <SystemSettings 
            initialSettings={systemSettings} 
            onUpdateSettings={handleUpdateSettings} 
          />
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen">
      {renderSidebar()}
      <div className="flex-1 overflow-auto bg-gray-50">{renderContent()}</div>
      
      {/* מודאל עריכת הזמנה - אם הוא פתוח */}
      {showBookingForm && (
        <BookingForm
          onClose={() => {
            setShowBookingForm(false);
            setBookingToEdit(null);
            setSelectedDateForBooking(null);
          }}
          selectedDate={
            selectedDateForBooking?.date || 
            (bookingToEdit ? bookingToEdit.date : new Date().toISOString().split('T')[0])
          }
          selectedTime={
            selectedDateForBooking?.time || 
            (bookingToEdit ? `${bookingToEdit.startTime}:00` : '08:00')
          }
          settings={systemSettings}
          onSubmit={handleBookingFormSubmit}
          isEditMode={!!bookingToEdit}
          initialData={bookingToEdit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
