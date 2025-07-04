import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { registerHotel } from "../controller/hotelController.js"


const hotelRouter = express.Router()
hotelRouter.post("/", protect, registerHotel)
//userRouter.post("/store-recent-serach", protect, storeRecentSeachCities)

export default hotelRouter