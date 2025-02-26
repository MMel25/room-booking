import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Calendar, LogOut, User, Phone, ClipboardList } from 'lucide-react';

import BookingManagement from './BookingManagement';
import SystemSettings from './SystemSettings';
import BookingService from '../services/bookingService';
import SettingsService from '../services/settingsService';

const AdminDashboard = ({ bookings: initialBookings, settings, onLogout }) => {
  // שימוש בהוקים
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  // מצבי הקומפוננטה
  const [activeView, setActiveView] = useState('dashboard');
  const [bookings, setBookings] = useState(initialBookings || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);

  // טעינת נתונים ראשונית אם לא התקבלו מלמעלה
  useEffect(() => {
    if (initialBookings && initialBookings.length > 0) {
      setBookings(initialBookings);
      return;
    }

    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const result = await BookingService.getBookings();
        if (result.success) {
          setBookings(result.bookings);
        }
      } catch (error) {
        console.error('שגיאה בטעינת הזמנות:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [initialBookings]);

  // פונקציות ניהול הזמנות
  const handleDeleteBooking = async (bookingToDelete) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
      return;
    }
    
    try {
      const result = await BookingService.deleteBooking(bookingToDelete.id);
      if (result.success) {
        setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
      } else {
        alert('שגיאה במחיקת ההזמנה: ' + result.message);
      }
    } catch (error) {
      console.error('שגיאה במחיקת הזמנה:', error);
      alert('שגיאה במחיקת ההזמנה');
    }
  };

  const handleEditBooking = (bookingToEdit) => {
    setBookingToEdit(bookingToEdit);
    setShowBookingForm(true);
  };

  const handleBookingFormSubmit = async (updatedBookingData) => {
    try {
      let result;
      
      if (bookingToEdit) {
        // עדכון הזמנה קיימת
        result = await BookingService.updateBooking(bookingToEdit.id, updatedBookingData);
      } else {
        // הוספת הזמנה חדשה
        result = await BookingService.addBooking(updatedBookingData);
      }
      
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
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const result = await SettingsService.updateSystemSettings(newSettings);
      if (result.success) {
        alert('ההגדרות נשמרו בהצלחה');
      } else {
        alert('שגיאה בשמירת ההגדרות: ' + result.message);
      }
    } catch (error) {
      console.error('שגיאה בעדכון הגדרות:', error);
      alert('שגיאה בעדכון ההגדרות');
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
            initialSettings={settings} 
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg">
            <button 
              className="absolute top-2 left-2 text-gray-500 hover:text-gray-700" 
              onClick={() => {
                setShowBookingForm(false);
                setBookingToEdit(null);
              }}
            >
              ✕
            </button>
            {/* כאן צריך להטמיע את טופס העריכה */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-amber-900 mb-4">
                {bookingToEdit ? 'עריכת הזמנה' : 'הזמנה חדשה'}
              </h3>
              {/* כאן יש להטמיע את טופס העריכה */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
