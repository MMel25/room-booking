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

    //
