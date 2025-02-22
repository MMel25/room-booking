import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';

const CalendarView = () => {
  const [viewMode, setViewMode] = useState('week');
  const [currentDate] = useState(new Date('2025-02-22'));

  const bookings = [
    { 
      date: '2025-02-22', 
      startTime: '09',
      endTime: '13', 
      apartment: '15'
    },
    {
      date: '2025-02-22',
      startTime: '15',
      endTime: '18', 
      apartment: '7'
    },
    {
      date: '2025-02-23',
      startTime: '10',
      endTime: '14', 
      apartment: '23'
    }
  ];

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
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 min-w-full">
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="flex-1 min-w-[180px] border-x">
              <div className="sticky top-0 bg-amber-50 p-2 text-center border-b">
                <div className="font-bold text-amber-900">{getDayName(day)}</div>
                <div className="text-sm text-amber-700">
                  {day.getDate()}/{day.getMonth() + 1}
                </div>
              </div>
              <div className="divide-y">
                {hours.map(hour => {
                  const isBooked = isTimeBooked(day, hour);
                  
                  return (
                    <div 
                      key={hour}
                      className={`p-2 min-h-[50px] cursor-pointer ${
                        isBooked ? 'bg-amber-50' : 'hover:bg-amber-50/30'
                      }`}
                    >
                      <div className="text-sm text-amber-900">{hour}:00</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MonthlyView = () => {
    const daysInMonth = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const days = [];
      
      for (let i = firstDay.getDay() - 1; i >= 0; i--) {
        const day = new Date(year, month, -i);
        days.push(day);
      }
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
      
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i));
      }
      
      return days;
    };

    return (
      <div className="grid grid-cols-7 gap-1">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
          <div key={day} className="p-2 text-center font-bold text-amber-900">
            {day}
          </div>
        ))}
        
        {daysInMonth().map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const hasBookings = bookings.some(b => b.date === formatDate(day));
          
          return (
            <div 
              key={index}
              className={`
                p-2 min-h-[100px] border rounded cursor-pointer
                ${isCurrentMonth ? '' : 'opacity-50'}
                ${hasBookings ? 'bg-amber-50' : 'hover:bg-amber-50/30'}
              `}
              onClick={() => {
                setViewMode('day');
              }}
            >
              <div className="font-medium text-amber-900">
                {day.getDate()}
              </div>
              {hasBookings && (
                <div className="mt-1 text-sm text-amber-800">
                  יש הזמנות
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const DailyView = () => (
    <div className="h-[600px] overflow-y-auto bg-white rounded-lg" dir="rtl">
      {hours.map(hour => {
        const isBooked = isTimeBooked(currentDate, hour);
        const booking = getBookingForTime(currentDate, hour);
        
        return (
          <div 
            key={hour}
            className={`flex border-b p-3 cursor-pointer transition-all ${
              isBooked ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-amber-50/30'
            }`}
          >
            <div className="w-20 text-right font-medium text-amber-900">
              {hour}:00
            </div>
            <div className="mr-4 text-amber-900">
              {isBooked ? `ד.${booking.apartment}` : 'פנוי'}
            </div>
          </div>
        );
      })}
    </div>
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

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#F5F5DC' }} dir="rtl">
      <Card className="max-w-6xl mx-auto shadow-lg">
        <CardHeader className="bg-white rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-medium text-amber-900">
              <Calendar className="h-6 w-6" />
              <span>חדר דיירים - בניין 5</span>
            </CardTitle>
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'month' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100'
                }`}
                onClick={() => setViewMode('month')}
              >
                חודשי
              </button>
              <button 
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'week' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100'
                }`}
                onClick={() => setViewMode('week')}
              >
                שבועי
              </button>
              <button 
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'day' ? 'bg-amber-100 text-amber-900' : 'bg-gray-100'
                }`}
                onClick={() => setViewMode('day')}
              >
                יומי
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button 
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: '#DEB887' }}
            >
              היום
            </button>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft className="h-5 w-5 text-amber-900" />
              </button>
              <span className="font-medium text-amber-900">
                {new Intl.DateTimeFormat('he-IL', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).format(currentDate)}
              </span>
              <button className="p-2 hover:bg-gray-100 rounded-full">
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
