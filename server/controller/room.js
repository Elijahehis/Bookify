import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary"
import Room from "../models/room.js";

export const createRoom = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { roomType, pricePerNight, amenities } = req.body;
        const hotel = await Hotel.findOne({ owner: userId })
        if (!hotel) {
            res.json({ sucess: false, message: "Hotel Not found" })
        }

        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path)
            return response.secure_url
        })
        const images = await Promise.all(uploadImages)
        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images
        })

        res.json({ success: true, message: "Room Created" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}



export const getRoom = async (req, res) => {
    try {
        const rooms = await Room.find({ isAvailable: true }).populate({
            path: "hotel",
            populate: {
                path: "owner",
                select: "image"
            }
        }).sort({ createdAt: -1 })
        res.json({ success: true, rooms })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}




export const getOwnersRoom = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const hotelData = await Hotel.findOne({ owner: userId });
        const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate("hotel");

        res.json({ success: true, rooms })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body
        const roomData = await Room.findById(roomId)
        roomData.isAvailable = !roomData.isAvailable
        await roomData.save()
        res.json({ success: true, message: "room updated" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}