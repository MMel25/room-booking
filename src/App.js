import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from './firebase';
import AccessPage from './components/AccessPage';
import CalendarView from './components/CalendarView';
import BookingForm from './components/BookingForm';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [settings, setSettings] = useState({
    title: 'חדר דיירים - בניין 5',
    maxBookingHours: 12,
    accessCode: '1234',
    regulations: 'יש לשמור על ניקיון החדר ולפנות אותו בזמן.'
  });
  const [bookings, setBookings] = useState([]);

  // קריאת הגדרות מ-Firebase כשהאפליקציה עולה
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = ref(db, 'settings');
        const snapshot = await get(settingsRef);
        
        if (snapshot.exists()) {
          setSettings(snapshot.val());
        } else {
          // אם אין הגדרות, ניצור הגדרות ברירת מחדל
          await set(ref(db, 'settings'), settings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    const fetchBookings = async () => {
      try {
        const bookingsRef = ref(db, 'bookings');
        const snapshot = await get(bookingsRef);
        
        if (snapshot.exists()) {
          const bookingsData = snapshot.val();
          const bookingsArray = Object.entries(bookingsData || {}).map(([id, data]) => ({
            id,
            ...data
          }));
          setBookings(bookingsArray);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchSettings();
    fetchBookings();
  }, []);

  if (!isAuthenticated) {
    return (
      <AccessPage 
        onAuthenticate={() => setIsAuthenticated(true)} 
        settings={settings}
      />
    );
  }

  return (
    <div dir="rtl">
      <CalendarView
        bookings={bookings}
        onTimeSelect={(date, time) => {
          setSelectedDate(date);
          setSelectedTime(time);
          setShowBookingForm(true);
        }}
        settings={settings}
      />
      
      {showBookingForm && (
        <BookingForm
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onClose={() => setShowBookingForm(false)}
          settings={settings}
          onSubmit={async (bookingData) => {
            try {
              // שמירת ההזמנה החדשה ב-Firebase
              const newBookingRef = ref(db, `bookings/${Date.now()}`);
              await set(newBookingRef, bookingData);
              
              // עדכון הרשימה המקומית
              setBookings([...bookings, { id: Date.now(), ...bookingData }]);
              setShowBookingForm(false);
            } catch (error) {
              console.error('Error saving booking:', error);
              alert('אירעה שגיאה בשמירת ההזמנה. נסה שוב מאוחר יותר.');
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
