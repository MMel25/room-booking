import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Trash2, Edit2, Calendar, Clock, Home, User, Phone, FileText } from 'lucide-react';
import BookingForm from './BookingForm';

const BookingManagement = ({ bookings, onDeleteBooking, onEditBooking }) => {
  const [filteredBookings, setFilteredBookings] = useState(bookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

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
        (booking.name && booking.name.includes(searchTerm)) ||
        (booking.apartment && booking.apartment.toString().includes(searchTerm)) ||
        (booking.date && booking.date.includes(searchTerm)) ||
        (booking.purpose && booking.purpose.includes(searchTerm)) ||
        (booking.phone && booking.phone.includes(searchTerm))
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

  // פונקציה להצגת יום בשבוע בעברית
  const getHebrewDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[date.getDay()];
  };

  // פונקציה לטיפול במחיקת הזמנה
  const handleDelete = (booking) => {
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את ההזמנה של ${booking.name || 'משתמש'} בתאריך ${booking.date}?`)) {
      onDeleteBooking(booking);
    }
  };

  // פונקציה לטיפול בעריכת הזמנה
  const handleEdit = (booking) => {
    // במקום לפתוח את הטופס כאן, נעביר את ההזמנה לעריכה ל-AdminDashboard
    onEditBooking(booking);
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
              placeholder="חפש לפי שם, דירה, תאריך, מטרה או טלפון"
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
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>תאריך</span>
                      {sortConfig.key === 'date' && 
                        (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </div>
                  </th>
                  <th className="p-2 text-right">
                    יום בשבוע
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('startTime')}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>התחלה</span>
                      {sortConfig.key === 'startTime' && 
                        (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </div>
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('endTime')}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>סיום</span>
                      {sortConfig.key === 'endTime' && 
                        (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </div>
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('apartment')}
                  >
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      <span>דירה</span>
                      {sortConfig.key === 'apartment' && 
                        (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </div>
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('purpose')}
                  >
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>מטרה</span>
                      {sortConfig.key === 'purpose' && 
                        (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </div>
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>שם</span>
                      {sortConfig.key === 'name' && 
                        (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </div>
                  </th>
                  <th 
                    className="p-2 text-right cursor-pointer hover:bg-amber-100"
                    onClick={() => handleSort('phone')}
                  >
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>טלפון</span>
                      {sortConfig.key === 'phone' && 
                        (sortConfig.direction === 'asc' ? ' ▲' : ' ▼')}
                    </div>
                  </th>
                  <th className="p-2">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => (
                  <tr key={booking.id || index} className="border-b hover:bg-amber-50/30">
                    <td className="p-2">{booking.date}</td>
                    <td className="p-2">{getHebrewDayName(booking.date)}</td>
                    <td className="p-2">{booking.startTime}:00</td>
                    <td className="p-2">{booking.endTime}:00</td>
                    <td className="p-2">{booking.apartment}</td>
                    <td className="p-2 max-w-[150px] truncate" title={booking.purpose}>
                      {booking.purpose}
                    </td>
                    <td className="p-2">{booking.name}</td>
                    <td className="p-2">{booking.phone}</td>
                    <td className="p-2 flex gap-2">
                      <button 
                        onClick={() => handleEdit(booking)}
                        className="text-amber-700 hover:bg-amber-100 p-1 rounded"
                        title="ערוך הזמנה"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(booking)}
                        className="text-red-700 hover:bg-red-100 p-1 rounded"
                        title="מחק הזמנה"
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
