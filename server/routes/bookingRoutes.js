import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { checkAvaliabilityApi, createBooking, getHotelBooking, getUsersBooking } from "../controller/booking.js"


const bookingRouter = express.Router()
bookingRouter.post("/check-availability", checkAvaliabilityApi)
bookingRouter.post("/book", protect, createBooking)
bookingRouter.get("/user", protect, getUsersBooking)
bookingRouter.post("/hotel", protect, getHotelBooking)
//userRouter.post("/store-recent-serach", protect, storeRecentSeachCities)

export default bookingRouter