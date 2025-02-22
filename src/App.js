import React, { useState } from 'react';
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
        />
      )}
    </div>
  );
};

export default App;
