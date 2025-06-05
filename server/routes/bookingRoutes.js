import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { checkAvaliabilityApi, createBooking, getHotelBooking, getUsersBooking, stripePayment } from "../controller/booking.js"


const bookingRouter = express.Router()
bookingRouter.post("/check-availability", checkAvaliabilityApi)
bookingRouter.post("/book", protect, createBooking)
bookingRouter.get("/user", protect, getUsersBooking)
bookingRouter.get("/hotel", protect, getHotelBooking)

bookingRouter.post("/stripe-payment", protect, stripePayment)
//userRouter.post("/store-recent-serach", protect, storeRecentSeachCities)

export default bookingRouter