import React, { useState, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ChevronRight, ChevronLeft, Calendar, Plus, Edit, Trash, LogOut } from 'lucide-react';

const CalendarView = ({ 
  bookings = [], 
  onTimeSelect, 
  onQuickBooking, 
  settings,
  onLogout,
  onBookingClick = null,  // פונקציה לטיפול בלחיצה על הזמנה קיימת
  isAdminView = false,    // פרמטר לציון מצב תצוגת מנהל
  isAdmin = false         // פרמטר לציון אם המשתמש הוא מנהל
}) => {
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
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // +1 כי החודשים מתחילים מ-0
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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

  // הסרנו את ניווט ההחלקה האופקית לתצוגת החודשים כמבוקש
  const handleTouchStart = useCallback((e) => {
    // פונקציה ריקה - אין צורך בטיפול בהחלקה אופקית
  }, []);

  const handleTouchEnd = useCallback((e) => {
    // פונקציה ריקה - אין צורך בטיפול בהחלקה אופקית
  }, []);

  // ניווט מהיר - הצגת 6 החודשים הבאים בלבד
  const MonthPicker = () => {
    const today = new Date();
    const futureMonths = [];
    
    // ייצור מערך של 6 החודשים הבאים
    for (let i = 0; i < 6; i++) {
      const futureDate = new Date(today);
      futureDate.setMonth(today.getMonth() + i);
      
      futureMonths.push({
        name: new Intl.DateTimeFormat('he-IL', { month: 'long' }).format(futureDate),
        year: futureDate.getFullYear(),
        month: futureDate.getMonth(),
        label: new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(futureDate)
      });
    }

    return (
      <div 
        ref={monthPickerRef}
        className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg p-4 z-10 max-h-64 overflow-y-auto"
        style={{ width: '300px' }}
      >
        <div className="font-bold mb-2 text-amber-900">בחר חודש:</div>
        <div className="grid grid-cols-2 gap-2">
          {futureMonths.map((item, index) => (
            <button
              key={index}
              className={`px-3 py-2 rounded text-center ${
                currentDate.getMonth() === item.month && currentDate.getFullYear() === item.year
                  ? 'bg-amber-100 text-amber-900' 
                  : 'hover:bg-amber-50'
              }`}
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setFullYear(item.year);
                newDate.setMonth(item.month);
                setCurrentDate(newDate);
                setShowMonthPicker(false);
              }}
            >
              {item.label}
            </button>
          ))}
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
        className="grid grid-cols-7 gap-1"
        style={{ 
          touchAction: 'auto', 
          userSelect: 'none',
          WebkitUserSelect: 'none'
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

  // תצוגה יומית עם יכולת ללחוץ על הזמנות קיימות
  const DailyView = () => (
    <div 
      className="h-[600px] overflow-y-auto bg-white rounded-lg" 
      dir="rtl"
      style={{ 
        touchAction: 'auto',
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
            onClick={() => {
              if (isBooked && onBookingClick) {
                // אם יש הזמנה וקיימת פונקציית onBookingClick, נפעיל אותה עם ההזמנה
                onBookingClick(booking);
              } else if (!isBooked) {
                // אם אין הזמנה, נפעיל את פונקציית onTimeSelect הרגילה
                onTimeSelect(formatDate(currentDate), `${hour}:00`);
              }
            }}
          >
            <div className="w-20 text-right font-medium text-amber-900">
              {hour}:00
            </div>
            <div className="mr-4 text-amber-900 flex-1">
              {isBooked ? (
                isAdminView ? (
                  // תצוגה מורחבת למנהל
                  <div className="flex flex-col">
                    <div className="font-medium">{`ד.${booking.apartment} - ${booking.name}`}</div>
                    <div className="text-sm text-amber-700">{`${booking.startTime}:00 - ${booking.endTime}:00`}</div>
                    <div className="text-sm text-amber-700">{booking.purpose}</div>
                  </div>
                ) : (
                  // תצוגה מינימלית למשתמש רגיל
                  <span>{`ד.${booking.apartment}`}</span>
                )
              ) : (
                <span>פנוי</span>
              )}
            </div>
            {!isBooked && (
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // מניעת הפעלת הפונקציה של אלמנט האב
                  onQuickBooking(formatDate(currentDate), `${hour}:00`);
                }}
              >
                <Plus className="h-4 w-4 text-amber-900" />
              </button>
            )}
            {isBooked && onBookingClick && isAdminView && (
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1">
                <button 
                  className="p-1 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation(); // מניעת הפעלת הפונקציה של אלמנט האב
                    onBookingClick(booking);
                  }}
                  title="ערוך הזמנה"
                >
                  <Edit className="h-4 w-4 text-amber-900" />
                </button>
              </div>
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
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center mb-2 md:mb-0">
              <CardTitle className="flex items-center gap-2 text-xl font-medium text-amber-900">
                <Calendar className="h-6 w-6" />
                <span>{settings.title}</span>
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'month' 
                    ? 'text-white' 
                    : 'bg-white text-amber-900 border border-amber-100'
                }`}
                style={viewMode === 'month' ? { backgroundColor: '#DEB887' } : {}}
                onClick={() => setViewMode('month')}
              >
                חודשי
              </button>
              <button 
                className={`px-4 py-2 rounded transition-colors ${
                  viewMode === 'day' 
                    ? 'text-white' 
                    : 'bg-white text-amber-900 border border-amber-100'
                }`}
                style={viewMode === 'day' ? { backgroundColor: '#DEB887' } : {}}
                onClick={() => setViewMode('day')}
              >
                יומי
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* כפתור התנתקות */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-1"
                  title="התנתק"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">התנתק</span>
                </button>
              )}
              
              <button 
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: '#DEB887' }}
                onClick={() => setCurrentDate(new Date())}
              >
                היום
              </button>
            </div>
            <div className="flex items-center gap-4 relative">
              <button className="p-2 hover:bg-gray-100 rounded-full"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  if (viewMode === 'day') {
                    newDate.setDate(newDate.getDate() - 1); // חץ ימינה מזיז אחורה בזמן ב-RTL
                  } else if (viewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() - 1); // חץ ימינה מזיז אחורה בזמן ב-RTL
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
                    newDate.setDate(newDate.getDate() + 1); // חץ שמאלה מזיז קדימה בזמן ב-RTL
                  } else if (viewMode === 'month') {
                    newDate.setMonth(newDate.getMonth() + 1); // חץ שמאלה מזיז קדימה בזמן ב-RTL
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
