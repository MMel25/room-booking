import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Calendar, LogOut, User, Phone, ClipboardList } from 'lucide-react';

import BookingManagement from './BookingManagement';
import SystemSettings from './SystemSettings';
import BookingForm from './BookingForm';
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

  // פונקציות ניהול הזמנות
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

  // נתונים סטטיסטיים לדשבורד
  const getStatistics = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // הזמנות היום
    const todayBookings = bookings.filter(b => b.date === todayString);
    
    // הזמנות החודש
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate.getMonth() === currentMonth && 
             bookingDate.getFullYear() === currentYear;
    });
    
    // הזמנות עתידיות
    const futureBookings = bookings.filter(b => b.date >= todayString);
    
    // הזמנות קרובות ממוינות לפי תאריך
    const upcomingBookings = [...futureBookings]
      .sort((a, b) => {
        // מיון לפי תאריך
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }
        // אם התאריך זהה, מיון לפי שעת התחלה
        return parseInt(a.startTime) - parseInt(b.startTime);
      })
      .slice(0, 5); // 5 הזמנות הקרובות ביותר
    
    return {
      todayCount: todayBookings.length,
      monthCount: monthBookings.length,
      futureCount: futureBookings.length,
      upcomingBookings
    };
  };

  // המרת מספר יום לשם היום בעברית
  const getHebrewDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[date.getDay()];
  };

  // רינדור תפריט צד
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

  // רינדור תצוגת הדשבורד הראשי
  const renderDashboard = () => {
    const stats = getStatistics();
    
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold text-amber-900 mb-6">לוח בקרה</h2>
        
        {/* כרטיסיות נתונים */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-700">הזמנות היום</p>
                  <h3 className="text-3xl font-bold text-amber-900">{stats.todayCount}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-700">הזמנות החודש</p>
                  <h3 className="text-3xl font-bold text-amber-900">{stats.monthCount}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-700">הזמנות עתידיות</p>
                  <h3 className="text-3xl font-bold text-amber-900">{stats.futureCount}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* טבלת הזמנות קרובות */}
        <Card className="bg-white">
          <CardHeader className="border-b p-4">
            <CardTitle className="text-xl text-amber-900">5 הזמנות קרובות</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-amber-50 border-b">
                  <tr>
                    <th className="p-3">תאריך</th>
                    <th className="p-3">יום</th>
                    <th className="p-3">שעות</th>
                    <th className="p-3">דירה</th>
                    <th className="p-3">מטרה</th>
                    <th className="p-3">מזמין</th>
                    <th className="p-3">טלפון</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingBookings.length > 0 ? (
                    stats.upcomingBookings.map((booking, index) => (
                      <tr key={booking.id || index} className="border-b hover:bg-amber-50">
                        <td className="p-3">{booking.date}</td>
                        <td className="p-3">{getHebrewDayName(booking.date)}</td>
                        <td className="p-3">{booking.startTime}:00 - {booking.endTime}:00</td>
                        <td className="p-3">{booking.apartment}</td>
                        <td className="p-3">{booking.purpose}</td>
                        <td className="p-3">{booking.name}</td>
                        <td className="p-3">{booking.phone}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-amber-700">
                        אין הזמנות קרובות
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // רינדור תצוגת התוכן המרכזית
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
          }}
          selectedDate={bookingToEdit ? bookingToEdit.date : new Date().toISOString().split('T')[0]}
          selectedTime={bookingToEdit ? `${bookingToEdit.startTime}:00` : '08:00'}
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
