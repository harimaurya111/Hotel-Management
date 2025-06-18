import express from 'express';
import {
  checkAvailabiltyApi,
  createBooking,
  getHotelBooking,
  getUsersBooking
} from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';
const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabiltyApi);
bookingRouter.post('/book', protect, createBooking);
bookingRouter.get('/user', protect, getUsersBooking);
bookingRouter.get('/hotel', protect, getHotelBooking);

export default bookingRouter;
