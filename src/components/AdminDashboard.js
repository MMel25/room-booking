import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Calendar, LogOut } from 'lucide-react';

import BookingManagement from './BookingManagement';
import SystemSettings from './SystemSettings';

const AdminDashboard = ({ bookings: initialBookings, settings, onLogout }) => {
  // שימוש בהוקים
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  // מצבי הקומפוננטה
  const [activeView, setActiveView] = useState('dashboard');
  const [bookings, setBookings] = useState(initialBookings || []);
  const [apartments, setApartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // טעינת נתונים ראשונית אם לא התקבלו מלמעלה
  useEffect(() => {
    // אם קיבלנו כבר נתונים מלמעלה, אין צורך בטעינה מחדש
    if (initialBookings && initialBookings.length > 0) {
      setBookings(initialBookings);
      setIsLoading(false);
      return;
    }

    // אחרת, טען מ-Firebase
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        
        // טען נתונים מהשירותים - רק אם צריך
        // כאן יופעלו השירותים שקראו ל-Firebase
        
      } catch (error) {
        console.error('שגיאה בטעינת נתונים:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [initialBookings]);

  // פונקציות ניהול הזמנות
  const handleDeleteBooking = async (bookingToDelete) => {
    try {
      // כאן נשלח בקשת מחיקה ל-Firebase
      // אם מוצלח - נעדכן את המצב המקומי
      setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
    } catch (error) {
      console.error('שגיאה במחיקת הזמנה:', error);
    }
  };

  const handleEditBooking = async (bookingToEdit) => {
    // כאן תוסיף לוגיקה לעריכת הזמנה
    console.log('עריכת הזמנה:', bookingToEdit);
  };

  // פונקציית התנתקות
  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout(); // קריאה לפונקציית ההתנתקות שהתקבלה מלמעלה
    navigate('/access');
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
        return <SystemSettings systemSettings={settings} />;
      default:
        return (
          <Card className="m-4">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900">
                סקירה כללית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50 p-4 rounded">
                  <h3 className="text-lg font-semibold">הזמנות היום</h3>
                  <p className="text-2xl">
                    {bookings.filter(b => 
                      b.date === new Date().toISOString().split('T')[0]
                    ).length}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded">
                  <h3 className="text-lg font-semibold">הזמנות מחר</h3>
                  <p className="text-2xl">
                    {bookings.filter(b => 
                      b.date === new Date(Date.now() + 86400000).toISOString().split('T')[0]  
                    ).length}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded">
                  <h3 className="text-lg font-semibold">סה"כ הזמנות</h3>
                  <p className="text-2xl">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-screen">
      {renderSidebar()}
      <div className="flex-1 overflow-auto bg-white">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;
