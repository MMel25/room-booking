import React, { useState, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ChevronRight, ChevronLeft, Calendar, Plus } from 'lucide-react';

const CalendarView = ({ bookings = [], onTimeSelect, onQuickBooking, settings }) => {
  const [viewMode, setViewMode] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [touchStart, setTouchStart] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef(null);

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

  // עדכון החלקה אופקית לתמיכה בניווט בין חודשים
  const handleTouchStart = useCallback((e) => {
    // וודא שזה רק מגע יחיד
    if (e.touches.length === 1) {
      setTouchStart(e.touches[0].clientX);
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    // וודא שזה רק מגע יחיד וקיים נקודת התחלה
    if (touchStart !== null && e.changedTouches.length === 1) {
      const touchEnd = e.changedTouches[0].clientX;
      const touchDiff = touchStart - touchEnd;

      // בדוק אם ההחלקה מספיק גדולה
      if (Math.abs(touchDiff) > 50) {
        const newDate = new Date(currentDate);
        if (touchDiff > 0) {
          // החלקה שמאלה - חודש קדימה (הפוך כפי שביקשת)
          newDate.setMonth(newDate.getMonth() + 1);
        } else {
          // החלקה ימינה - חודש אחורה (הפוך כפי שביקשת)
          newDate.setMonth(newDate.getMonth() - 1);
        }
        setCurrentDate(newDate);
      }

      // איפוס נקודת ההתחלה
      setTouchStart(null);
    }
  }, [touchStart, currentDate]);

  // ניווט מהיר בין חודשים
  const MonthPicker = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(i);
      return {
        name: new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(date),
        value: i
      };
    });

    const years = Array.from({ length: 5 }, (_, i) => {
      const year = new Date().getFullYear() - 2 + i;
      return year;
    });

    return (
      <div 
        ref={monthPickerRef}
        className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg p-4 z-10 max-h-64 overflow-y-auto"
        style={{ width: '300px' }}
      >
        <div className="mb-4">
          <div className="font-bold mb-2 text-amber-900">שנה:</div>
          <div className="grid grid-cols-3 gap-2">
            {years.map(year => (
              <button
                key={year}
                className={`px-3 py-2 rounded text-center ${
                  currentDate.getFullYear() === year 
                    ? 'bg-amber-100 text-amber-900' 
                    : 'hover:bg-amber-50'
                }`}
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setFullYear(year);
                  setCurrentDate(newDate);
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="font-bold mb-2 text-amber-900">חודש:</div>
          <div className="grid grid-cols-3 gap-2">
            {months.map(month => (
              <button
                key={month.value}
                className={`px-3 py-2 rounded text-center ${
                  currentDate.getMonth() === month.value 
                    ? 'bg-amber-100 text-amber-900' 
                    : 'hover:bg-amber-50'
                }`}
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(month.value);
                  setCurrentDate(newDate);
                  setShowMonthPicker(false);
                }}
              >
                {month.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // סגירת בוחר החודשים בלחיצה מחוץ לאלמנט
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target) && 
          showMonthPicker) {
        setShowMonthPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthPicker]);

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
      <div 
        className="grid grid-cols-7 gap-1 touch-pan-x"
        // עדכון תמיכה בגלילה אופקית
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ 
          touchAction: 'pan-x', 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          overflowX: 'auto'
        }}
      >
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
                setCurrentDate(day);
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

  // תצוגה יומית עם תיקון לחיצה על הפלוס
  const DailyView = () => (
    <div 
      className="h-[600px] overflow-y-auto bg-white rounded-lg" 
      dir="rtl"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ 
        touchAction: 'pan-x',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {hours.map(hour => {
        const isBooked = isTimeBooked(currentDate, hour);
        const booking = getBookingForTime(currentDate, hour);
        
        return (
          <div 
            key={hour}
            className={`flex border-b p-3 cursor-pointer transition-all relative ${
              isBooked ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-amber-50/30'
            }`}
            onClick={() => !isBooked && onTimeSelect(formatDate(currentDate), `${hour}:00`)}
          >
            <div className="w-20 text-right font-medium text-amber-900">
              {hour}:00
            </div>
            <div className="mr-4 text-amber-900">
              {isBooked ? `ד.${booking.apartment}` : 'פנוי'}
            </div>
            {!isBooked && (
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
                onClick={(e) => {
                  // הוסר e.stopPropagation() כדי לאפשר פתיחת טופס הזמנה גם בלחיצה על הפלוס
                  onQuickBooking(formatDate(currentDate), `${hour}:00`);
                }}
              >
                <Plus className="h-4 w-4 text-amber-900" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  const getView = () => {
    switch(viewMode) {
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
              <span>{settings.title}</span>
            </CardTitle>
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-amber-100 text-amber-900' 
                    : 'bg-white text-amber-900 border border-amber-100'
                }`}
                onClick={() => setViewMode('month')}
              >
                חודשי
              </button>
              <button 
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'day' 
                    ? 'bg-amber-100 text-amber-900' 
                    : 'bg-white text-amber-900 border border-amber-100'
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
              onClick={() => setCurrentDate(new Date())}
            >
              היום
            </button>
            <div className="flex items-center gap-4 relative">
              <button className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'day') {
                    newDate.setDate(newDate.getDate() + 1); // הפוך - ימין הולך קדימה
                  } else if (viewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1); // הפוך - ימין הולך קדימה
                  }
                  setCurrentDate(newDate);
                }}
              >
                <ChevronRight className="h-5 w-5 text-amber-900" />
              </button>
              <span 
                className="font-medium text-amber-900 cursor-pointer hover:underline"
                onClick={() => setShowMonthPicker(!showMonthPicker)}
              >
                {new Intl.DateTimeFormat('he-IL', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).format(currentDate)}
              </span>
              <button className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'day') {
                    newDate.setDate(newDate.getDate() - 1); // הפוך - שמאל הולך אחורה
                  } else if (viewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1); // הפוך - שמאל הולך אחורה
                  }
                  setCurrentDate(newDate);
                }}
              >
                <ChevronLeft className="h-5 w-5 text-amber-900" />
              </button>
              {showMonthPicker && <MonthPicker />}
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
