import transporter from "../config/nodeMailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// 🔹 Function to check room availability
const checkAvailabilty = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });
    const isAvailable = bookings.length === 0;
    return isAvailable;
  } catch (error) {
    console.log("Availability check error:", error.message);
    throw new Error("Failed to check availability");
  }
};

// 🔹 API: Check availability of a room
export const checkAvailabiltyApi = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;

    const isAvailable = await checkAvailabilty({
      checkInDate,
      checkOutDate,
      room,
    });

    res.status(200).json({ success: true, isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 API: Create a new booking
//Post/api/bookings/book
export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    // Check availability first
    const isAvailable = await checkAvailabilty({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Room is not available for the selected dates.",
      });
    }

    // Get room price
    const roomData = await Room.findById(room).populate("hotel");
    if (!roomData) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Calculate nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    let totalPrice = roomData.pricePerNight * nights;

    // Create booking
    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: "Hotel Booking Details",
      html: `
  <h2>Your Booking Details</h2>
  <p>Dear ${req.user.username},</p>
  <p>Thank you for your booking! Here are your details:</p>
  <ul>
    <li><strong>Booking ID:</strong> ${booking._id}</li>
    <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
    <li><strong>Location:</strong> ${roomData.hotel.address}</li>
    <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
    <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || "$"} ${
        booking.totalPrice
      } /night</li>
  </ul>
  <p>We look forward to welcoming you!</p>
  <p>If you need to make any changes, feel free to contact us.</p>
`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.log("Booking creation error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to create booking." });
  }
};

// 🔹 API: Get all bookings for a user
//GET/api/bookings/user

export const getUsersBooking = async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ user: userId })
      .populate("room hotel")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch user bookings." });
  }
};

// 🔹 API: Get bookings for hotel owner
export const getHotelBooking = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for the logged-in owner.",
      });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0
    );

    res.status(200).json({
      success: true,
      dashboardData: {
        totalBookings,
        totalRevenue,
        bookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotel bookings.",
    });
  }
};
