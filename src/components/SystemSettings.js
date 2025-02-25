import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Settings } from 'lucide-react';

const SystemSettings = ({ 
  initialSettings, 
  onUpdateSettings 
}) => {
  const [settings, setSettings] = useState(initialSettings);
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    
    // בדיקות אימות
    if (adminPassword !== confirmPassword) {
      setPasswordError('הסיסמאות אינן תואמות');
      return;
    }

    // שליחת ההגדרות המעודכנות
    onUpdateSettings({
      ...settings,
      adminPassword
    });
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="text-xl text-amber-900">
          <Settings className="inline-block w-5 h-5 mr-2" />
          הגדרות מערכת
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          {/* שדות הגדרות */}
          <div>
            <label htmlFor="adminPassword" className="block mb-1">
              סיסמת מנהל
            </label>
            <input 
              type="password"
              id="adminPassword"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-1">
              אימות סיסמה
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
            {passwordError && (
              <p className="mt-1 text-red-500">{passwordError}</p>
            )}
          </div>
          <button 
            type="submit"
            className="px-4 py-2 text-white bg-amber-500 rounded hover:bg-amber-600"
          >
            שמור הגדרות
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
