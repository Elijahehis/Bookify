import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { getUserData, storeRecentSeachCities } from "../controller/userController.js"

const userRouter = express.Router()
userRouter.get("/", protect, getUserData)
userRouter.post("/store-recent-serach", protect, storeRecentSeachCities)

export default userRouter