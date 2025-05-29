import User from "../models/user.js"
import { Webhook } from "svix"

const clerkwebhook = async () => {
    try {
        const hook = new Webhook(process.env.CLERK_WEBHOOK)
        const headers = {
            "svix-id": req.headers["svix-d"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        }
        await hook.verify(JSON.stringify(req.body), headers)

        const { data, type } = req.body

        const userData = {
            _id: data._id,
            email: data.email_addresses[0].email_address,
            username: data.first_name + "" + data.last_name,
            image: data.image_url
        }

        switch (type) {
            case "user.created": {
                await User.create(userData)
                break;
            }

            case "user.updated": {
                await User.findByIdAndUpdate(data.id, userData)
                break;
            }

            case "user.delete": {
                await User.findByIdAndDelete(data.id)
                break;
            }

            default:
                break;
        }
        res.json({ success: true, message: "Webhook Recieved" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export default clerkwebhook