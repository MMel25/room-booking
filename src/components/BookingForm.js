import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ChevronRight } from 'lucide-react';

const BookingForm = ({ onClose, selectedDate, selectedTime }) => {
  const [formData, setFormData] = useState({
    apartment: '',
    name: '',
    phone: '',
    purpose: '',
    acceptTerms: false
  });

  const apartmentOptions = Array.from({ length: 37 }, (_, i) => i + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    // כאן יתווסף הקוד לשמירת ההזמנה
    console.log('Form submitted:', formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <Card className="w-full max-w-md my-8">
        <CardHeader className="bg-white rounded-t-lg border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium text-amber-900">
              הזמנת חדר
            </CardTitle>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-amber-50 rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-amber-900" />
            </button>
          </div>
          <div className="text-sm text-amber-700">
            {selectedDate} | {selectedTime}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-amber-900 mb-1">
                מספר דירה
                <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.apartment}
                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">בחר דירה</option>
                {apartmentOptions.map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-amber-900 mb-1">
                שם מלא
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-amber-900 mb-1">
                טלפון נייד
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                required
                pattern="05[0-9]{8}"
                placeholder="05X-XXXXXXX"
              />
            </div>

            <div>
              <label className="block text-amber-900 mb-1">
                מטרת השימוש בחדר
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full p-2 rounded border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-amber-800 mb-4">
                תקנון השימוש בחדר:
                <div className="mt-2 p-3 bg-amber-50 rounded text-amber-700">
                  יש לשמור על ניקיון החדר...
                  {/* כאן יוצג התקנון המלא */}
                </div>
              </div>
              
              <label className="flex items-start gap-2 text-amber-900">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  required
                  className="mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-right">
                  אני מתחייב/ת לפעול לפי תקנון השימוש בחדר
                  <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 p-2 rounded border border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="flex-1 p-2 rounded text-white"
                style={{ backgroundColor: '#DEB887' }}
              >
                אישור הזמנה
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
