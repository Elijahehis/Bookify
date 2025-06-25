import transporter from "../configs/nodemailer.js";
import Booking from "../models/booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/room.js";
import stripe from "stripe"

const checkAvaliability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        if (!checkInDate || !checkOutDate || !room) return false;

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        console.log("Checking availability for:", { room, checkIn, checkOut });

        const bookings = await Booking.find({
            room,
            checkInDate: { $lt: checkOut },
            checkOutDate: { $gt: checkIn }
        });

        console.log("Found conflicting bookings:", bookings.length);
        return bookings.length === 0;
    } catch (error) {
        console.error("Availability check error:", error.message);
        return false;
    }
};

export const checkAvaliabilityApi = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, room } = req.body
        const isAvailable = await checkAvaliability({ checkInDate, checkOutDate, room })
        console.log("Availability check result for room", room, ":", isAvailable)
        res.json({ success: true, isAvailable })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


export const createBooking = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, room, guests } = req.body
        const user = req.user._id
        const isAvailable = await checkAvaliability({ checkInDate, checkOutDate, room })
        if (!isAvailable) {
            return res.json({ success: false, message: "room unavailable" })
        }
        const roomData = await Room.findById(room).populate("hotel")
        let totalPrice = roomData.pricePerNight;

        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)

        const timediff = checkOut.getTime() - checkIn.getTime()
        const nights = Math.ceil(timediff / (1000 * 3600 * 24))

        totalPrice *= nights
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: "Hotel Booking Details",
            html: `
            <h2> Your Bookify Reservation Details   </h2>
            <p> Dear ${req.user.username} </p>
            <p> Thank you for your booking! Here are your details: </p>
            <ul>
               <li><strong>Booking ID:${booking._id}</strong></li>
                <li><strong>HOTEL NAME:</strong> ${roomData.hotel.name}</li>
                 <li><strong>LOCATION:</strong> ${roomData.hotel.address}</li>
                  <li><strong>DATE:</strong> ${booking.checkInDate.toDateString()}</li>
                   <li><strong>BOOKING AMOUNT: ${process.env.CURRENCY || "$"} ${booking.totalPrice}/night</strong></li>
            </ul>
           <p> We look foward to welcoming you </p>
                   `
        }

        await transporter.sendMail(mailOptions)

        res.json({ success: true, message: "Booking created" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "fail to create booking" })
    }
}


export const getUsersBooking = async (req, res) => {
    try {
        const user = req.user._id
        const bookings = await Booking.find({ user }).populate("room hotel").sort({ createdAt: -1 })

        res.json({ success: true, bookings })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "failed to fetch booking" })
    }
}


export const getHotelBooking = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const hotel = await Hotel.findOne({ owner: userId })
        if (!hotel) {
            return res.json({ success: false, message: "No hotel found" })
        }
        const bookings = await Booking.find({ hotel: hotel._id, }).populate("room hotel user").sort({ createdAt: -1 })
        const totalBookings = bookings.length
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0)
        res.json({
            success: true, dashboardData: {
                totalBookings,
                totalRevenue,
                bookings
            }
        })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "failed to fetch booking" })
    }
}


export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId)
        const roomData = await Room.findById(booking.room).populate("hotel")
        const totalPrice = booking.totalPrice;
        const { origin } = req.headers;
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const line_items = [
            {
                price_data: {
                    currency: "pln",
                    product_data: {
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100
                },
                quantity: 1,
            }
        ]
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader/my-booking`,
            cancel_url: `${origin}/my-booking`,
            metadata: {
                bookingId
            }
        })
        res.json({ success: true, url: session.url })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: "Payment failed" })
    }
}