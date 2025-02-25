import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Trash2, Edit2 } from 'lucide-react';

const BookingManagement = ({ bookings, onDeleteBooking, onEditBooking }) => {
  const [filteredBookings, setFilteredBookings] = useState(bookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  // פונקציית מיון
  const sortBookings = (bookingsToSort) => {
    return [...bookingsToSort].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // עדכון רשימת ההזמנות המסוננות
  useEffect(() => {
    let result = bookings;
    
    // סינון לפי מונח חיפוש
    if (searchTerm) {
      result = result.filter(booking => 
        booking.name.includes(searchTerm) ||
        booking.apartment.toString().includes(searchTerm) ||
        booking.date.includes(searchTerm)
      );
    }
    
    // מיון
    result = sortBookings(result);
    
    setFilteredBookings(result);
  }, [bookings, searchTerm, sortConfig]);

  // פונקציית מיון
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="p-4" dir="rtl">
      <Card>
        <CardHeader className="bg-white border-b">
          <CardTitle className="text-xl text-amber-900">
            ניהול הזמנות
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* שורת חיפוש וסינון */}
          <div className="mb-4 flex gap-4">
            <input
              type="text"
              placeholder="חפש לפי שם, דירה או תאריך"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow p-2 rounded border border-amber-200"
            />
          </div>

          {/* טבלת הזמנות */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('date')}
                  >
                    תאריך
                    {sortConfig.key === 'date' && 
                      (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('startTime')}
                  >
                    שעת התחלה
                    {sortConfig.key === 'startTime' && 
                      (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('endTime')}
                  >
                    שעת סיום
                    {sortConfig.key === 'endTime' && 
                      (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('apartment')}
                  >
                    דירה
                    {sortConfig.key === 'apartment' && 
                      (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('name')}
                  >
                    שם
                    {sortConfig.key === 'name' && 
                      (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                  </th>
                  <th className="p-2">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr key={index} className="border-b hover:bg-amber-50/30">
                    <td className="p-2">{booking.date}</td>
                    <td className="p-2">{booking.startTime}:00</td>
                    <td className="p-2">{booking.endTime}:00</td>
                    <td className="p-2">{booking.apartment}</td>
                    <td className="p-2">{booking.name}</td>
                    <td className="p-2 flex gap-2">
                      <button 
                        onClick={() => onEditBooking(booking)}
                        className="text-amber-700 hover:bg-amber-100 p-1 rounded"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => onDeleteBooking(booking)}
                        className="text-red-700 hover:bg-red-100 p-1 rounded"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBookings.length === 0 && (
              <div className="text-center text-amber-700 p-4">
                לא נמצאו הזמנות
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingManagement;
