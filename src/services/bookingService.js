// bookingService.js
import { v4 as uuidv4 } from 'uuid';

class BookingService {
  constructor() {
    // אתחול מקומי של ההזמנות ב-localStorage אם לא קיים
    if (!localStorage.getItem('bookings')) {
      localStorage.setItem('bookings', JSON.stringify([]));
    }
  }

  // שליפת כל ההזמנות
  getBookings() {
    const bookings = localStorage.getItem('bookings');
    return bookings ? JSON.parse(bookings) : [];
  }

  // הוספת הזמנה חדשה
  addBooking(bookingData) {
    const bookings = this.getBookings();
    
    // בדיקת חפיפה עם הזמנות קיימות
    const isOverlapping = bookings.some(existingBooking => 
      existingBooking.apartment === bookingData.apartment &&
      existingBooking.date === bookingData.date &&
      this.isTimeOverlapping(
        existingBooking.startTime, 
        existingBooking.endTime, 
        bookingData.startTime, 
        bookingData.endTime
      )
    );

    if (isOverlapping) {
      return {
        success: false,
        message: 'קיימת הזמנה חופפת עבור דירה זו בתאריך ובשעות אלה'
      };
    }

    // הוספת מזהה ייחודי להזמנה
    const newBooking = {
      ...bookingData,
      id: uuidv4()
    };

    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    return {
      success: true,
      booking: newBooking
    };
  }

  // עדכון הזמנה קיימת
  updateBooking(bookingId, updatedData) {
    const bookings = this.getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
      return {
        success: false,
        message: 'הזמנה לא נמצאה'
      };
    }

    // בדיקת חפיפה עם הזמנות אחרות
    const isOverlapping = bookings.some((existingBooking, index) => 
      index !== bookingIndex && 
      existingBooking.apartment === updatedData.apartment &&
      existingBooking.date === updatedData.date &&
      this.isTimeOverlapping(
        existingBooking.startTime, 
        existingBooking.endTime, 
        updatedData.startTime, 
        updatedData.endTime
      )
    );

    if (isOverlapping) {
      return {
        success: false,
        message: 'קיימת הזמנה חופפת עבור דירה זו בתאריך ובשעות אלה'
      };
    }

    // עדכון ההזמנה
    const updatedBooking = {
      ...bookings[bookingIndex],
      ...updatedData
    };

    bookings[bookingIndex] = updatedBooking;
    localStorage.setItem('bookings', JSON.stringify(bookings));

    return {
      success: true,
      booking: updatedBooking
    };
  }

  // מחיקת הזמנה
  deleteBooking(bookingId) {
    const bookings = this.getBookings();
    const filteredBookings = bookings.filter(b => b.id !== bookingId);

    if (bookings.length === filteredBookings.length) {
      return {
        success: false,
        message: 'הזמנה לא נמצאה'
      };
    }

    localStorage.setItem('bookings', JSON.stringify(filteredBookings));

    return {
      success: true
    };
  }

  // בדיקת חפיפת זמנים
  isTimeOverlapping(existingStart, existingEnd, newStart, newEnd) {
    // המרת שעות למספרים לצורך השוואה
    const existingStartNum = parseInt(existingStart);
    const existingEndNum = parseInt(existingEnd);
    const newStartNum = parseInt(newStart);
    const newEndNum = parseInt(newEnd);

    // בדיקת חפיפה
    return !(newEndNum <= existingStartNum || newStartNum >= existingEndNum);
  }

  // סינון הזמנות לפי קריטריונים
  filterBookings(filters) {
    let bookings = this.getBookings();

    if (filters.date) {
      bookings = bookings.filter(b => b.date === filters.date);
    }

    if (filters.apartment) {
      bookings = bookings.filter(b => b.apartment === filters.apartment);
    }

    if (filters.name) {
      bookings = bookings.filter(b => 
        b.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    return bookings;
  }
}

// יצירת סינגלטון
export default new BookingService();
