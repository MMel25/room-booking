import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

const CalendarView = ({ onTimeSelect, settings }) => {
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const bookingsRef = ref(db, 'bookings');
    onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedBookings = Object.entries(data).map(([id, booking]) => ({
          id,
          ...booking,
        }));
        setBookings(fetchedBookings);
      }
    });
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => 
    `${String(i).padStart(2, '0')}`
  );

  const getDayName = (date) => {
    const dayName = new Intl.DateTimeFormat('he-IL', { weekday: 'short' }).format(date);
    return date.getDay() === 6 ? `יום ${dayName}` : dayName;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isTimeBooked = (date, hour) => {
    return bookings.some(booking => {
      const startHour = parseInt(booking.startTime);
      const endHour = parseInt(booking.endTime);
      const currentHour = parseInt(hour);
      return booking.date === formatDate(date) && 
             currentHour >= startHour && 
             currentHour < endHour;
    });
  };

  const getBookingForTime = (date, hour) => {
    return bookings.find(booking => {
      const startHour = parseInt(booking.startTime);
      const endHour = parseInt(booking.endTime);
      const currentHour = parseInt(hour);
      return booking.date === formatDate(date) && 
             currentHour >= startHour && 
             currentHour < endHour;
    });
  };

  const WeeklyView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(currentDate);
      day.setDate(currentDate.getDate() - currentDate.getDay() + i);
      return day;
    });

    return (
      {/* ... */}
    );
  };

  const MonthlyView = () => {
    {/* ... */}
  };

  const DailyView = () => (
    {/* ... */}
  );

  const getView = () => {
    switch(viewMode) {
      case 'week':
        return <WeeklyView />;
      case 'month':
        return <MonthlyView />;
      default:
        return <DailyView />;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
    }
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#F5F5DC' }} dir="rtl">
      <Card className="max-w-6xl mx-auto shadow-lg">
        <CardHeader className="bg-white rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-medium text-amber-900">
              <Calendar className="h-6 w-6" />
              <span>{settings.title}</span>
            </CardTitle>
            <div className="flex gap-2">
              {/* ... */}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: '#DEB887' }}
              onClick={goToToday}
            >
              היום
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full" onClick={goToPrevious}>
                <ChevronLeft className="h-5 w-5 text-amber-900" />
              </button>
              <span className="font-medium text-amber-900">
                {new Intl.DateTimeFormat('he-IL', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).format(currentDate)}
              </span>
              <button className="p-2 hover:bg-gray-100 rounded-full" onClick={goToNext}>
                <ChevronRight className="h-5 w-5 text-amber-900" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          {getView()}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
