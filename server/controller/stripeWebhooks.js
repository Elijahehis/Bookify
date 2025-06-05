import stripe from "stripe";
import Booking from "../models/booking.js";

export const stripeWebHooks = async (request, response) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];
    let event;

    try {
        // Stripe expects raw body
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("❌ Stripe Webhook Error:", err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        try {
            const sessions = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
                limit: 1
            });

            const session = sessions.data[0];
            if (!session) {
                console.error("❌ No session found for payment intent:", paymentIntentId);
                return response.status(404).send("Session not found.");
            }

            const { bookingId } = session.metadata;

            const updated = await Booking.findByIdAndUpdate(
                bookingId,
                {
                    isPaid: true,
                    paymentMethod: "Credit Card",
                },
                { new: true }
            );

            if (!updated) {
                console.error("❌ Booking not found for ID:", bookingId);
            } else {
                console.log("✅ Booking updated as paid:", bookingId);
            }

        } catch (err) {
            console.error("❌ Error updating booking:", err.message);
            return response.status(500).send("Failed to update booking.");
        }
    } else {
        console.log("Unhandled event type:", event.type);
    }

    // ✅ Always send this last
    response.json({ received: true });
};
