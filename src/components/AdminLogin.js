import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // בדיקת סיסמה - כאן תוסיף אימות מול מסד נתונים או שירות אימות
    const ADMIN_PASSWORD = 'admin123'; // החלף בהגדרה מאובטחת יותר
    
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('סיסמה שגויה. אנא נסה שנית.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-xl text-center text-amber-900">
            כניסת מנהל מערכת
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-amber-900 mb-2">
                הזן סיסמת מנהל
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded border border-amber-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full p-2 rounded text-white"
              style={{ backgroundColor: '#DEB887' }}
            >
              התחבר
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
