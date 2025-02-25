import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Lock, Loader2 } from 'lucide-react';

const AccessPage = ({ onAuthenticate, settings }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      console.log('Checking access code:', accessCode);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (accessCode === settings.accessCode) {
        console.log('Access granted');
        onAuthenticate && onAuthenticate();
      } else {
        setError('קוד גישה שגוי');
      }
    } catch (error) {
      setError('אירעה שגיאה, נסה שוב מאוחר יותר');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }} 
      dir="rtl"
    >
      {/* שכבת האפלה כדי לשפר את קריאות הטקסט על רקע התמונה */}
      <div 
        className="absolute inset-0 bg-black opacity-40"
        style={{ backdropFilter: 'blur(2px)' }}
      ></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 mb-4 shadow-sm">
            <Lock className="h-8 w-8 text-amber-900" />
          </div>
          <h1 className="text-2xl font-bold text-white">{settings.title}</h1>
        </div>

        <Card className="shadow-lg border-0 overflow-hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="accessCode" className="block text-sm font-medium text-amber-900 mb-1">
                  קוד גישה
                </label>
                <div className="relative">
                  <input
                    id="accessCode"
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className={`w-full p-3 border-2 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all ${
                      error ? 'border-red-400' : 'border-amber-200'
                    }`}
                    style={{ backgroundColor: '#FFFCF6' }}
                    placeholder="הכנס קוד גישה"
                    dir="rtl"
                  />
                </div>
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
                  <span>כניסה</span>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessPage;
