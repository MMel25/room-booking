import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Settings, Calendar, LogOut, ClipboardList, Plus } from 'lucide-react';

import BookingManagement from './BookingManagement';
import SystemSettings from './SystemSettings';
import BookingForm from './BookingForm';
import CalendarView from './CalendarView';
import BookingService from '../services/bookingService';
import SettingsService from '../services/settingsService';

const AdminDashboard = ({ bookings: initialBookings, settings, onLogout }) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!initialBookings || initialBookings.length === 0) {
          const bookingsResult = await BookingService.getBookings();
          if (bookingsResult.success) {
            setBookings(bookingsResult.bookings);
          }
        }
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

  const handleEditBooking = (booking) => {
    setBookingToEdit(booking);
    setShowBookingForm(true);
  };

  const handleNewBookingFromCalendar = (date, time) => {
    setBookingToEdit({ date, startTime: time });
    setShowBookingForm(true);
  };

  const renderSidebar = () => {
    const menuItems = [
      { key: 'dashboard', label: 'לוח בקרה', icon: <Home className="w-5 h-5" /> },
      { key: 'bookings', label: 'ניהול הזמנות', icon: <ClipboardList className="w-5 h-5" /> },
      { key: 'calendar', label: 'תצוגת יומן', icon: <Calendar className="w-5 h-5" /> },
      { key: 'settings', label: 'הגדרות מערכת', icon: <Settings className="w-5 h-5" /> }
    ];

    return (
      <div className="w-64 bg-amber-50 p-4 border-l" dir="rtl">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-amber-900">ממשק ניהול</h2>
          <p className="text-sm text-amber-700">{user?.email || "מנהל מערכת"}</p>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveView(item.key)}
            className={`w-full flex items-center p-3 mb-2 rounded 
              ${activeView === item.key ? 'bg-amber-200 text-amber-900' : 'hover:bg-amber-100'}`}
          >
            <span className="ml-2">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <button
          onClick={logout}
          className="w-full flex items-center p-3 mt-4 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          <LogOut className="w-5 h-5 ml-2" />
          התנתק
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-amber-900 text-center">טוען נתונים...</p>;
    }
    switch (activeView) {
      case 'bookings':
        return <BookingManagement bookings={bookings} onEditBooking={handleEditBooking} />;
      case 'calendar':
        return <CalendarView bookings={bookings} onTimeSelect={handleNewBookingFromCalendar} settings={systemSettings} />;
      case 'settings':
        return <SystemSettings initialSettings={systemSettings} />;
      default:
        return <p className="text-amber-900 text-center">ברוך הבא לממשק הניהול</p>;
    }
  };

  return (
    <div className="flex h-screen">
      {renderSidebar()}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">{renderContent()}</div>
      {showBookingForm && (
        <BookingForm
          onClose={() => setShowBookingForm(false)}
          selectedDate={bookingToEdit?.date || new Date().toISOString().split('T')[0]}
          selectedTime={bookingToEdit?.startTime || '08:00'}
          settings={systemSettings}
          onSubmit={() => setShowBookingForm(false)}
          isEditMode={!!bookingToEdit?.id}
          initialData={bookingToEdit}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
