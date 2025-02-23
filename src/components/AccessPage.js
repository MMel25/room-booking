import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Lock } from 'lucide-react';

const AccessPage = ({ onAuthenticate }) => {
  const [accessCode, setAccessCode] = useState('');
  const [title, setTitle] = useState('חדר דיירים - בניין 5');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Checking access code:', accessCode);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (accessCode === '1234') {
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5DC' }} dir="rtl">
      <Card className="w-full max-w-md shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
        <CardHeader className="bg-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl font-medium text-amber-900">
            <Lock className="h-6 w-6" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full p-2 border rounded text-right"
                style={{ 
                  borderColor: error ? '#FF4444' : '#D2B48C',
                  backgroundColor: '#FFFEFC'
                }}
                placeholder="הכנס קוד גישה"
                dir="rtl"
              />
              {error && (
                <p className="mt-1 text-right text-sm" style={{ color: '#FF4444' }}>
                  {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-2 rounded font-medium transition-colors"
              style={{ 
                backgroundColor: isLoading ? '#D2B48C' : '#DEB887',
                color: '#FFFFFF',
                cursor: isLoading ? 'wait' : 'pointer'
              }}
            >
              {isLoading ? 'בודק...' : 'כניסה'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessPage;
