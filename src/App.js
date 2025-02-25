// התחלת הקומפוננטה App נשארת אותו דבר...

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);  // הוספנו סטייט חדש
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

  // אתחול ראשוני וניקוי אימות
  useEffect(() => {
    const initialize = async () => {
      // ניקוי אימות
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      setIsAuthenticated(false);
      
      try {
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
        setIsInitialized(true);  // סימון שהאתחול הסתיים
      }
    };

    initialize();
  }, []);  // רץ פעם אחת בטעינה

  // שאר הפונקציות נשארות אותו דבר...

  // אם האתחול עדיין לא הסתיים, נציג מסך טעינה
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        טוען...
      </div>
    );
  }

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
            isAuthenticated ? (
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
            ) : (
              <Navigate to="/access" replace />
            )
          } 
        />

        {/* ... שאר הנתיבים נשארים אותו דבר ... */}
      </Routes>
    </Router>
  );
};

export default App;
