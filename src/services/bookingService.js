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
          bookingData
