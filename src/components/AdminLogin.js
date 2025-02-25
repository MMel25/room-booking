import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  // שימוש בהוק האימות והניווט
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  // מצבי הקומפוננטה
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // פונקציית הטיפול בטופס ההתחברות
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // איפוס הודעות שגיאה
    setError('');
    setIsLoading(true);

    // בדיקות תקינות בסיסיות
    if (!email || !password) {
      setError('אנא הזן אימייל וסיסמה');
      setIsLoading(false);
      return;
    }

    try {
      // ביצוע התחברות
      const result = await login(email, password);

      if (result.success) {
        // מעבר למסך הניהול בהצלחה
        navigate('/dashboard');
      } else {
        // הצגת הודעת שגיאה
        setError(result.message || 'התחברות נכשלה');
      }
    } catch (err) {
      // טיפול בשגיאות לא צפויות
      console.error('שגיאת התחברות:', err);
      setError('אירעה שגיאה. אנא נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50" dir="rtl">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-xl text-center text-amber-900">
            כניסת מנהל מערכת
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-amber-900 mb-2">
                אימייל
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded border border-amber-200 focus:outline-none focus:border-amber-500"
                placeholder="הזן כתובת אימייל"
                required
              />
            </div>
            <div>
              <label className="block text-amber-900 mb-2">
                סיסמה
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded border border-amber-200 focus:outline-none focus:border-amber-500"
                placeholder="הזן סיסמה"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-2 rounded text-white transition-colors duration-300 ${
                isLoading 
                  ? 'bg-amber-400 cursor-not-allowed' 
                  : 'bg-amber-700 hover:bg-amber-800'
              }`}
            >
              {isLoading ? 'מתחבר...' : 'התחבר'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
