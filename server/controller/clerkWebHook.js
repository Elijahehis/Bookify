import User from "../models/user.js";
import { Webhook } from "svix";

const clerkwebhook = async (req, res) => {
    try {
        const hook = new Webhook(process.env.CLERK_WEBHOOK);
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        const evt = await hook.verify(JSON.stringify(req.body), headers);
        const { data, type } = evt;

        // Always available:
        const clerkId = data.id;

        // Optional, only available on create/update
        const email = data.email_addresses?.[0]?.email_address || "";
        const username = `${data.first_name || ""}${data.last_name || ""}`;
        const image = data.image_url || "";

        switch (type) {
            case "user.created":
                await User.create({
                    _id: clerkId,
                    email,
                    username,
                    image,
                });
                break;

            case "user.updated":
                await User.findByIdAndUpdate(clerkId, {
                    email,
                    username,
                    image,
                });
                break;

            case "user.deleted":
                await User.findByIdAndDelete(clerkId);
                break;

            default:
                console.log(`Unhandled event type: ${type}`);
                break;
        }

        res.status(200).json({ success: true, message: "Webhook received" });
    } catch (error) {
        console.error("Webhook error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkwebhook;
