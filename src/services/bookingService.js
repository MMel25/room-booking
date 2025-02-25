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
import { db } from './firebase';

class BookingService {
  constructor() {
    this.bookingsRef = ref(db, 'bookings');
  }

  // הוספת הזמנה חדשה
  async addBooking(bookingData) {
    try {
      // בדיקת חפיפה עם הזמנות קיימות
      const overlappingQuery = query(
        this.bookingsRef, 
        orderByChild('apartment'), 
        equalTo(bookingData.apartment)
      );

      const snapshot = await get(overlappingQuery);
      const existingBookings = snapshot.val() || {};

      // בדיקת חפיפת זמנים
      const isOverlapping = Object.values(existingBookings).some(booking => 
        booking.date === bookingData.date &&
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

      return {
        success: true,
        booking: newBooking
      };
    } catch (error) {
      console.error('שגיאה בהוספת הזמנה:', error);
      return {
        success: false,
        message: 'שגיאה בהוספת הזמנה'
      };
    }
  }

  // שליפת כל ההזמנות
  async getBookings(filters = {}) {
    try {
      const snapshot = await get(this.bookingsRef);
      let bookings = [];

      if (snapshot.exists()) {
        bookings = Object.values(snapshot.val());

        // סינון לפי תאריך
        if (filters.date) {
          bookings = bookings.filter(b => b.date === filters.date);
        }

        // סינון לפי דירה
        if (filters.apartment) {
          bookings = bookings.filter(b => b.apartment === filters.apartment);
        }

        // סינון לפי שם
        if (filters.name) {
          bookings = bookings.filter(b => 
            b.name.toLowerCase().includes(filters.name.toLowerCase())
          );
        }
      }

      return {
        success: true,
        bookings: bookings
      };
    } catch (error) {
      console.error('שגיאה בשליפת הזמנות:', error);
      return {
        success: false,
        message: 'שגיאה בשליפת הזמנות'
      };
    }
  }

  // עדכון הזמנה
  async updateBooking(bookingId, updatedData) {
    try {
      const bookingRef = ref(db, `bookings/${bookingId}`);

      // בדיקת חפיפה עם הזמנות אחרות
      const overlappingQuery = query(
        this.bookingsRef, 
        orderByChild('apartment'), 
        equalTo(updatedData.apartment)
      );

      const snapshot = await get(overlappingQuery);
      const existingBookings = snapshot.val() || {};

      // בדיקת חפיפת זמנים תוך התעלמות מההזמנה הנוכחית
      const isOverlapping = Object.entries(existingBookings).some(([key, booking]) => 
        key !== bookingId &&
        booking.date === updatedData.date &&
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
      const updatedBooking = {
        ...updatedData,
        id: bookingId,
        updatedAt: new Date().toISOString()
      };

      await set(bookingRef, updatedBooking);

      return {
        success: true,
        booking: updatedBooking
      };
    } catch (error) {
      console.error('שגיאה בעדכון הזמנה:', error);
      return {
        success: false,
        message: 'שגיאה בעדכון הזמנה'
      };
    }
  }

  // מחיקת הזמנה
  async deleteBooking(bookingId) {
    try {
      const bookingRef = ref(db, `bookings/${bookingId}`);
      await remove(bookingRef);

      return {
        success: true
      };
    } catch (error) {
      console.error('שגיאה במחיקת הזמנה:', error);
      return {
        success: false,
        message: 'שגיאה במחיקת הזמנה'
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
