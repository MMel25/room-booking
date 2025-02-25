import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import BookingManagement from './BookingManagement';
import SystemSettings from './SystemSettings';
import { Home, Settings, Calendar } from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
  // מצבים לניהול התצוגה הנוכחית
  const [activeView, setActiveView] = useState('dashboard');
  
  // דאטה דמה להדגמה - בפועל תחליף זאת בקריאת נתונים ממסד הנתונים
  const [bookings, setBookings] = useState([
    {
      date: '2024-02-25', 
      startTime: '10', 
      endTime: '14', 
      apartment: 1, 
      name: 'ישראל כהן'
    },
    {
      date: '2024-02-26', 
      startTime: '12', 
      endTime: '16', 
      apartment: 2, 
      name: 'שרה לוי'
    }
  ]);

  // פונקציות לניהול הזמנות
  const handleDeleteBooking = (bookingToDelete) => {
    setBookings(bookings.filter(booking => booking !== bookingToDelete));
  };

  const handleEditBooking = (bookingToEdit) => {
    // כאן תוסיף לוגיקה לעריכת הזמנה
    console.log('עריכת הזמנה:', bookingToEdit);
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
          onClick={onLogout}
          className="w-full p-3 mt-4 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          התנתק
        </button>
      </div>
    );
  };

  // רינדור תצוגת התוכן המרכזית
  const renderContent = () => {
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
        return <SystemSettings />;
      default:
        return (
          <Card className="m-4">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900">
                סקירה כללית
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-amber-50 p-4 rounded">
                  <h3 className="text-lg font-semibold">הזמנות היום</h3>
                  <p className="text-2xl">{bookings.length}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded">
                  <h3 className="text-lg font-semibold">דירות פעילות</h3>
                  <p className="text-2xl">2</p>
                </div>
                <div className="bg-amber-50 p-4 rounded">
                  <h3 className="text-lg font-semibold">סה״כ הזמנות</h3>
                  <p className="text-2xl">{bookings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white" dir="rtl">
      {renderSidebar()}
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
