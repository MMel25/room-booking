import React, { useState } from 'react';
import { Lock, Loader2, Settings } from 'lucide-react';

const AccessPage = ({ onAuthenticate, onAdminAuthenticate, settings }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Checking access code:', accessCode);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // המרת הקוד למספר לצורך השוואה
      const numericCode = Number(accessCode);
      
      if (isAdminMode) {
        // בדיקת קוד מנהל
        if (numericCode === settings.adminCode) {
          console.log('Admin access granted');
          onAdminAuthenticate && onAdminAuthenticate();
        } else {
          setError('קוד מנהל שגוי');
        }
      } else {
        // בדיקת קוד משתמש רגיל
        if (numericCode === settings.accessCode) {
          console.log('Access granted');
          onAuthenticate && onAuthenticate();
        } else {
          setError('קוד גישה שגוי');
        }
      }
    } catch (error) {
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
            {isAdminMode ? 'ממשק ניהול' : settings.title}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg shadow-md border border-amber-100">
          <div>
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
            />
            {error && (
              <p className="mt-2 text-right text-sm text-red-500 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                {error}
              </p>
            )}
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
