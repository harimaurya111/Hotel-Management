import express from "express"
import upload from "../middlewares/uploadMiddleware.js"
import { protect } from "../middlewares/authMiddleware.js"
import { creatRoom, getOwnerRooms, getRooms, toggleRoomAvailability } from "../controllers/roomController.js"

const roomRouter = express.Router()

roomRouter.post("/",upload.array("images",4),protect,creatRoom)
roomRouter.get("/",getRooms)
roomRouter.get("/owner",protect,getOwnerRooms)
roomRouter.post("/toggle-availabillity",protect,toggleRoomAvailability)



export default roomRouter