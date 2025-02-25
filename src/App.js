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
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // נקה את האימות בטעינה הראשונית
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setIsLoading(false);
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
    regulations: 'יש החדר מוקצה לשימוש פרטי של דיירי הבניין בלבד...'
  });
  const [bookings, setBookings] = useState([]);

  // קריאת הגדרות מ-Firebase כשהאפליקציה עולה
  useEffect(() => {
    // נקה את האימות בטעינה הראשונית
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);

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

  // הגדרת מצב מחובר
  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  // התנתקות
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <Router>
      <Routes>
        {/* נתיב הכניסה והאימות */}
        <Route 
          path="/access" 
          element={
            <AccessPage 
              onAuthenticate={handleAuthenticate} 
              settings={settings}
            />
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

        {/* נתיבי מנהל */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute>
              <BookingManagement onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute>
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
