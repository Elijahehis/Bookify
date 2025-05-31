import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import upload from "../middleware/upload.js"
import { createRoom, getOwnersRoom, getRoom, toggleRoomAvailability } from "../controller/room.js"



const roomRouter = express.Router()
roomRouter.post("/", upload.array("images", 4), protect, createRoom)
roomRouter.get("/", getRoom)
roomRouter.get("/owner", protect, getOwnersRoom)
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability)
//userRouter.post("/store-recent-serach", protect, storeRecentSeachCities)

export default roomRouter