import React, { useState } from 'react';
import { Lock, Loader2, Settings } from 'lucide-react';

const AccessPage = ({ onAuthenticate, settings }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // בדיקה האם קיים מידע שמור בדפדפן בעת טעינת הדף
  React.useEffect(() => {
    // בדיקה האם המשתמש בחר לזכור אותו בעבר
    const userRemembered = localStorage.getItem('userRemembered') === 'true';
    const adminRemembered = localStorage.getItem('adminRemembered') === 'true';
    
    // אם יש נתונים שמורים, נטען אותם בהתאם למצב
    if (isAdminMode && adminRemembered) {
      const savedCode = localStorage.getItem('adminCode');
      if (savedCode) {
        setAccessCode(savedCode);
        setRememberMe(true);
      }
    } else if (!isAdminMode && userRemembered) {
      const savedCode = localStorage.getItem('userCode');
      if (savedCode) {
        setAccessCode(savedCode);
        setRememberMe(true);
      }
    }
  }, [isAdminMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Checking access code:', accessCode);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // המרה למספרים לצורך השוואה
      const numericCode = Number(accessCode);
      const settingsAccessCode = Number(settings.accessCode);
      const settingsAdminCode = Number(settings.adminCode);
      
      console.log('Debug:', {
        numericCode,
        settingsAccessCode,
        settingsAdminCode,
        isAdminMode
      });

      if (isAdminMode) {
        // בדיקת קוד מנהל
        if (numericCode === settingsAdminCode) {
          console.log('Admin access granted');
          // שמירת העדפת זכירת המשתמש אם נבחרה האפשרות
          if (rememberMe) {
            localStorage.setItem('adminRemembered', 'true');
            localStorage.setItem('adminCode', accessCode);
            // שמירת מצב התחברות כדי לבצע כניסה אוטומטית בעת רענון
            localStorage.setItem('authState', 'admin');
          } else {
            localStorage.removeItem('adminRemembered');
            localStorage.removeItem('adminCode');
            localStorage.removeItem('authState');
          }
          onAuthenticate(true); // true מציין שזו כניסת מנהל
        } else {
          setError('קוד מנהל שגוי');
        }
      } else {
        // בדיקת קוד רגיל
        if (numericCode === settingsAccessCode) {
          console.log('User access granted');
          // שמירת העדפת זכירת המשתמש אם נבחרה האפשרות
          if (rememberMe) {
            localStorage.setItem('userRemembered', 'true');
            localStorage.setItem('userCode', accessCode);
            // שמירת מצב התחברות כדי לבצע כניסה אוטומטית בעת רענון
            localStorage.setItem('authState', 'user');
          } else {
            localStorage.removeItem('userRemembered');
            localStorage.removeItem('userCode');
            localStorage.removeItem('authState');
          }
          onAuthenticate(false); // false מציין שזו כניסה רגילה
        } else {
          setError('קוד גישה שגוי');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('אירעה שגיאה, נסה שוב מאוחר יותר');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-end justify-center p-4 sm:items-center" 
      style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }} 
      dir="rtl"
    >
      <div 
        className="absolute inset-0 bg-black opacity-30"
        style={{ backdropFilter: 'blur(1px)' }}
      ></div>
      
      <div className="w-full max-w-md relative z-10 mb-8 sm:mb-0">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white bg-opacity-90 mb-4 shadow-sm">
            {isAdminMode ? (
              <Settings className="h-8 w-8 text-amber-900" />
            ) : (
              <Lock className="h-8 w-8 text-amber-900" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {isAdminMode ? 'כניסת מנהל' : settings.title}
          </h1>
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="space-y-5 bg-white p-6 rounded-lg shadow-md border border-amber-100"
          method="post"
          autoComplete="on"
        >
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-amber-700 mb-1">
              {isAdminMode ? "קוד מנהל" : "קוד גישה"}
            </label>
            <input
              id="accessCode"
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className={`w-full p-3 border rounded-md text-right focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all ${
                error ? 'border-red-400' : 'border-amber-200'
              }`}
              style={{ backgroundColor: '#FFFCF9' }}
              placeholder={isAdminMode ? "הכנס קוד מנהל" : "הכנס קוד גישה"}
              dir="rtl"
              autoComplete={isAdminMode ? "current-password" : "current-password"}
              name={isAdminMode ? "admin-password" : "access-password"}
            />
            {error && (
              <p className="mt-2 text-right text-sm text-red-500 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                {error}
              </p>
            )}
          </div>
          
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="h-4 w-4 border-amber-300 rounded text-amber-600 focus:ring-amber-500"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
                          <label htmlFor="rememberMe" className="mr-2 block text-sm text-amber-700">
              השאר אותי מחובר
            </label>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
              isLoading ? 'bg-amber-200' : 'bg-amber-600 hover:bg-amber-700'
            }`}
            style={{ color: '#FFFFFF' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>בודק...</span>
              </>
            ) : (
              <span>{isAdminMode ? 'כניסה לממשק ניהול' : 'כניסה'}</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              setAccessCode('');
              setError('');
            }}
            className="w-full text-amber-700 text-sm hover:text-amber-800 transition-colors p-2"
          >
            {isAdminMode ? 'חזרה לכניסה רגילה' : 'כניסת מנהל'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccessPage;
