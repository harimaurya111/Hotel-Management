import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

// POST /api/rooms - Create Room
export const createRoom = async (req, res) => {
    console.log("✅ Room creation: req.auth.userId =", req.auth?.userId); // ADD THIS

  try {
    const { roomType, pricePerNight, amenities } = req.body;
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    console.log("✅ Found hotel:", hotel); // ADD THIS


    if (!hotel) return res.status(404).json({ success: false, message: "No Hotel Found" });

    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    const images = await Promise.all(uploadImages);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: + pricePerNight,
      amenities: JSON.parse(amenities),
      images,
    });

    res.status(201).json({
      success: true,
      message: "Room Created Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/rooms - Get All Available Rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "image",
        },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/owner/rooms - Get Owner's Rooms
export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ owner: req.auth.userId });
    const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");

    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/rooms/toggle - Toggle Room Availability
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);
    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();

    res.status(200).json({ success: true, message: "Room Availability Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
