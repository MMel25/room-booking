import React, { useState, useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate 
} from 'react-router-dom';
import { db } from './firebase';
import AccessPage from './components/AccessPage';
import CalendarView from './components/CalendarView';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';
import BookingManagement from './components/BookingManagement';
import SystemSettings from './components/SystemSettings';

// קומפוננטת הגנה על נתיבים
const ProtectedRoute = ({ children, requireAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const storedAuth = localStorage.getItem('isAuthenticated');
      const storedRole = localStorage.getItem('userRole');
      
      setIsAuthenticated(storedAuth === 'true');
      setIsAdmin(storedRole === 'admin');
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        טוען...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/access" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  // ניקוי אימות בטעינה ראשונית
  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
  }, []);

  // קריאת הגדרות וההזמנות מ-Firebase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = ref(db, 'settings');
        const snapshot = await get(settingsRef);
        
        if (snapshot.exists()) {
          setSettings(snapshot.val());
        } else {
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

  // טיפול בהתחברות
  const handleAuthenticate = (isAdmin) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');
  };

  // טיפול בהתנתקות
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
  };

  return (
    <Router>
      <Routes>
        {/* נתיב הכניסה והאימות */}
        <Route 
          path="/access" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <AccessPage 
                onAuthenticate={handleAuthenticate} 
                settings={settings}
              />
            )
          } 
        />

        {/* נתיב הלוח שנה - מוגן */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div dir="rtl">
                <CalendarView
                  bookings={bookings}
                  onTimeSelect={(date, time) => {
                    setSelectedDate(date);
                    setSelectedTime(time);
                    setShowBookingForm(true);
                  }}
                  settings={settings}
                  onLogout={handleLogout}
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
            </ProtectedRoute>
          } 
        />

        {/* נתיבי מנהל - מוגנים ודורשים הרשאת מנהל */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute requireAdmin>
              <BookingManagement onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute requireAdmin>
              <SystemSettings onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* הפניה דיפולטיבית */}
        <Route path="*" element={<Navigate to="/access" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
