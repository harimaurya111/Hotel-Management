import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    // 1. Check if user already registered a hotel
    const hotel = await Hotel.findOne({ owner });
    if (hotel) {
      return res.status(400).json({
        success: false,
        message: "Hotel already registered",
      });
    }

    // 2. Create new hotel
    await Hotel.create({ name, address, contact, city, owner });

    // 3. Update user role to 'hotelOwner'
    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    // 4. Success response
    return res.status(201).json({
      success: true,
      message: "Hotel registered successfully",
    });
  } catch (error) {
    console.error("Register Hotel Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
