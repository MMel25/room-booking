// src/services/bookingService.js
import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove,
  query,
  orderByChild,
  equalTo 
} from "firebase/database";
import { db } from '../firebase';

class BookingService {
  constructor() {
    this.bookingsRef = ref(db, 'bookings');
  }

  // קבלת כל ההזמנות
  async getAllBookings() {
    try {
      const snapshot = await get(this.bookingsRef);
      if (snapshot.exists()) {
        return Object.entries(snapshot.val()).map(([id, data]) => ({
          id,
          ...data
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting all bookings:', error);
      return [];
    }
  }

  // הוספת הזמנה חדשה
  async addBooking(bookingData) {
    try {
      console.log('Adding new booking:', bookingData);
      
      // בדיקת חפיפה עם הזמנות קיימות
      const existingBookings = await this.getAllBookings();
      
      // בדיקת חפיפת זמנים
      const isOverlapping = existingBookings.some(booking => 
        booking.date === bookingData.date &&
        booking.apartment === bookingData.apartment && // רק אם מדובר באותה דירה
        this.isTimeOverlapping(
          booking.startTime, 
          booking.endTime, 
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

      // הוספת הזמנה חדשה
      const newBookingRef = push(this.bookingsRef);
      const newBooking = {
        ...bookingData,
        id: newBookingRef.key,
        createdAt: new Date().toISOString()
      };

      await set(newBookingRef, newBooking);
      console.log('New booking added successfully:', newBooking);

      return {
        success: true,
        booking: newBooking
      };
    } catch (error) {
      console.error('Error adding booking:', error);
      return {
        success: false,
        message: 'שגיאה בהוספת הזמנה',
        error: error.message
      };
    }
  }

  // שליפת כל ההזמנות
  async getBookings(filters = {}) {
    try {
      console.log('Getting bookings with filters:', filters);
      const bookings = await this.getAllBookings();
      let filteredBookings = [...bookings];

      // סינון לפי תאריך
      if (filters.date) {
        filteredBookings = filteredBookings.filter(b => b.date === filters.date);
      }

      // סינון לפי דירה
      if (filters.apartment) {
        filteredBookings = filteredBookings.filter(b => b.apartment === filters.apartment);
      }

      // סינון לפי שם
      if (filters.name) {
        filteredBookings = filteredBookings.filter(b => 
          b.name && b.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }

      return {
        success: true,
        bookings: filteredBookings
      };
    } catch (error) {
      console.error('Error getting bookings:', error);
      return {
        success: false,
        message: 'שגיאה בשליפת הזמנות',
        error: error.message
      };
    }
  }

  // עדכון הזמנה
  async updateBooking(bookingId, updatedData) {
    try {
      if (!bookingId) {
        return {
          success: false,
          message: 'נדרש מזהה הזמנה לעדכון'
        };
      }

      console.log(`Updating booking ${bookingId} with:`, updatedData);
      
      // בדיקת חפיפה עם הזמנות אחרות
      const existingBookings = await this.getAllBookings();
      
      // בדיקת חפיפת זמנים תוך התעלמות מההזמנה הנוכחית
      const isOverlapping = existingBookings.some(booking => 
        booking.id !== bookingId &&
        booking.date === updatedData.date &&
        booking.apartment === updatedData.apartment && // רק אם מדובר באותה דירה
        this.isTimeOverlapping(
          booking.startTime, 
          booking.endTime, 
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
      const bookingRef = ref(db, `bookings/${bookingId}`);
      const updatedBooking = {
        ...updatedData,
        id: bookingId,
        updatedAt: new Date().toISOString()
      };

      await update(bookingRef, updatedBooking);
      console.log('Booking updated successfully');

      return {
        success: true,
        booking: updatedBooking
      };
    } catch (error) {
      console.error('Error updating booking:', error);
      return {
        success: false,
        message: 'שגיאה בעדכון הזמנה',
        error: error.message
      };
    }
  }

  // מחיקת הזמנה
  async deleteBooking(bookingId) {
    try {
      if (!bookingId) {
        return {
          success: false,
          message: 'נדרש מזהה הזמנה למחיקה'
        };
      }

      console.log(`Deleting booking ${bookingId}`);
      const bookingRef = ref(db, `bookings/${bookingId}`);
      await remove(bookingRef);
      console.log('Booking deleted successfully');

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting booking:', error);
      return {
        success: false,
        message: 'שגיאה במחיקת הזמנה',
        error: error.message
      };
    }
  }

  // בדיקת חפיפת זמנים פנימית
  isTimeOverlapping(existingStart, existingEnd, newStart, newEnd) {
    const existingStartNum = parseInt(existingStart);
    const existingEndNum = parseInt(existingEnd);
    const newStartNum = parseInt(newStart);
    const newEndNum = parseInt(newEnd);

    return !(newEndNum <= existingStartNum || newStartNum >= existingEndNum);
  }
}

export default new BookingService();
