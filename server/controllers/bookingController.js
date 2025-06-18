import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

//Function to check availabilty of room
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
    console.log(error.message);
  }
};

//Api to check availabilty of room

export const checkAvailabiltyApi = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailabilty({
      checkInDate,
      checkOutDate,
      room,
    });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//Api to create new Booking
// post /api/booking/book

export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const userId = req.user._id;

    //Before Booking check Availabilty

    const isAvailable = await checkAvailabilty({
      checkInDate,
      checkOutDate,
      room,
    });
    if (!isAvailable)
      return res.json({ success: false, message: "Room not available" });

    // Get total Price from room

    const roomData = await Room.findbyid(room).populate("hotel");
    let totalPrice = roomData.pricePerNight;

    // Calculate total Price based on nights

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkInDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    totalPrice *= nights;

    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel_id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });
    res.json({ success: true, message: "Booking Created Successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "Failed to Booking created" });
  }
};

//Api to get all Booking for a user
// post /api/booking/user

export const getUsersBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const booking = await Booking.findById({ userId })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, booking });
  } catch (error) {
    res.json({ success: false, message: "Failed to fetch Bookings" });
  }
};


export const getHotelBooking = async  (req , res) =>{
    try {
        const hotel = await Hotel.findOne({owner:req.auth.userId})
        if(!hotel) {
            return res.json({success:false , message:"No Hotel Found"})
        }
        const bookings = await Booking.find({hotel:hotel._id}).populate("room hotel user").sort({createdAt:-1})
        const totalBookings = bookings.length
        const totalRevenue = bookings.reduce((acc,booking)=>acc+booking.totalPrice,0)
        res.json({success:true , dashboardData:totalBookings,totalRevenue,bookings})
    } catch (error) {
        res.json({success:false ,message:"Failed to fetch bookings"})
    }
}