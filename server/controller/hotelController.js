import Hotel from "../models/Hotel.js"
import User from "../models/user.js"


export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city } = req.body
        const owner = req.user._id
        const hotel = await Hotel.findOne({ owner })
        if (hotel) {
            res.json({ success: false, message: "Already registered" })
        }
        await Hotel.create({ name, address, contact, city, owner })
        await User.findByIdAndUpdate(owner, { role: "hotelOwner" })
        res.json({ success: true, message: "Hotel Adedd" })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}