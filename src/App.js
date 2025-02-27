import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useLocation
} from 'react-router-dom';
import { db } from './firebase';
import { AdminAuthProvider } from './context/AdminAuthContext';
import AccessPage from './components/AccessPage';
import CalendarView from './components/CalendarView';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';

// רכיב עזר לדיבוג - יתעד את מצב האימות בקונסול
const AuthDebugger = ({ isAuthenticated, isAdmin }) => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Auth Debug Info:', { 
      isAuthenticated, 
      isAdmin, 
      currentPath: location.pathname,
      localStorage: {
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        userRole: localStorage.getItem('userRole'),
        authState: localStorage.getItem('authState'),
        userRemembered: localStorage.getItem('userRemembered'),
        adminRemembered: localStorage.getItem('adminRemembered')
      }
    });
  }, [isAuthenticated, isAdmin, location]);
  
  return null; // רכיב לא מרנדר דבר
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [settings, setSettings] = useState({
    title: 'חדר דיירים בן חור 4',
    maxBookingHours: 12,
    accessCode: '4334',
    adminCode: '3266',
    regulations: 'יש החדר מוקצה לשימוש פרטי של דיירי הבניין בלבד...'
  });
  const [bookings, setBookings] = useState([]);
  
  // בדיקת אפשרות "השאר אותי מחובר" בעת טעינה
  useEffect(() => {
    const checkRememberedLogin = () => {
      const authState = localStorage.getItem('authState');
      
      if (authState) {
        console.log('Found remembered login state:', authState);
        
        if (authState === 'admin' && localStorage.getItem('adminRemembered') === 'true') {
          const savedAdminCode = localStorage.getItem('adminCode');
          if (savedAdminCode && Number(savedAdminCode) === Number(settings.adminCode)) {
            console.log('Auto-login as admin');
            setIsAuthenticated(true);
            setIsAdmin(true);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', 'admin');
            return true;
          }
        } else if (authState === 'user' && localStorage.getItem('userRemembered') === 'true') {
          const savedUserCode = localStorage.getItem('userCode');
          if (savedUserCode && Number(savedUserCode) === Number(settings.accessCode)) {
            console.log('Auto-login as regular user');
            setIsAuthenticated(true);
            setIsAdmin(false);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', 'user');
            return true;
          }
        }
      }
      
      return false;
    };
    
    // אם האתחול הושלם, בדוק אפשרות כניסה אוטומטית
    if (isInitialized) {
      const wasAutoLoggedIn = checkRememberedLogin();
      
      // רק אם אין כניסה אוטומטית, אז נקה את המצב הקיים
      if (!wasAutoLoggedIn) {
        console.log('No auto-login, clearing authentication state');
        setIsAuthenticated(false);
        setIsAdmin(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
      }
    }
  }, [isInitialized, settings]);

  // אתחול ראשוני וטעינת נתונים
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing app and loading data');
        
        // טעינת הגדרות
        const settingsRef = ref(db, 'settings');
        const snapshot = await get(settingsRef);
        
        if (snapshot.exists()) {
          setSettings(snapshot.val());
        } else {
          await set(ref(db, 'settings'), settings);
        }

        // טעינת הזמנות
        const bookingsRef = ref(db, 'bookings');
        const bookingsSnapshot = await get(bookingsRef);
        
        if (bookingsSnapshot.exists()) {
          const bookingsData = bookingsSnapshot.val();
          const bookingsArray = Object.entries(bookingsData || {}).map(([id, data]) => ({
            id,
            ...data
          }));
          setBookings(bookingsArray);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  // טיפול בהתחברות
  const handleAuthenticate = (isAdminUser) => {
    console.log('Authentication successful:', { isAdminUser });
    setIsAuthenticated(true);
    setIsAdmin(isAdminUser);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');
  };

  // טיפול בהתנתקות
  const handleLogout = () => {
    console.log('Logging out');
    setIsAuthenticated(false);
    setIsAdmin(false);
    
    // ניקוי כל המידע המקומי כולל "השאר אותי מחובר"
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authState');
    localStorage.removeItem('adminRemembered');
    localStorage.removeItem('adminCode');
    localStorage.removeItem('userRemembered');
    localStorage.removeItem('userCode');
  };

  // אם האתחול עדיין לא הסתיים, נציג מסך טעינה
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        טוען...
      </div>
    );
  }

  return (
    <AdminAuthProvider>
      <Router>
        <AuthDebugger isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        
        <Routes>
          {/* נתיב הכניסה והאימות */}
          <Route 
            path="/access" 
            element={
              isAuthenticated ? (
                <Navigate to={isAdmin ? "/dashboard" : "/"} replace />
              ) : (
                <AccessPage 
                  onAuthenticate={handleAuthenticate} 
                  settings={settings}
                />
              )
            } 
          />

          {/* נתיב למסך הניהול - למנהלים בלבד */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated && isAdmin ? (
                <AdminDashboard 
                  bookings={bookings}
                  settings={settings} 
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/access" replace />
              )
            } 
          />

          {/* נתיב הלוח שנה - מוגן */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <div dir="rtl">
                  <CalendarView
                    bookings={bookings}
                    onTimeSelect={(date, time) => {
                      setSelectedDate(date);
                      setSelectedTime(time);
                      setShowBookingForm(true);
                    }}
                    onQuickBooking={(date, time) => {
                      setSelectedDate(date);
                      setSelectedTime(time);
                      setShowBookingForm(true);
                    }}
                    settings={settings}
                    onLogout={handleLogout}
                    isAdmin={isAdmin}
                  />
                  
                  {showBookingForm && (
                    <BookingForm
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onClose={() => setShowBookingForm(false)}
                      settings={settings}
                      onSubmit={async (bookingData) => {
                        try {
                          const newBookingRef = ref(db, `bookings/${Date.now()}`);
                          await set(newBookingRef, bookingData);
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
              ) : (
                <Navigate to="/access" replace />
              )
            } 
          />

          {/* נתיב ברירת מחדל - הפניה תמיד לדף הכניסה */}
          <Route path="*" element={<Navigate to="/access" replace />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
};

export default App;
