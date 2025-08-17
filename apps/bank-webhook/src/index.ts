import express from "express";
import db from "@repo/db/client";

const app = express();

app.use(express.json());

app.post("/hdfcWebhook", async (req, res) => {
    //TODO1: Add zod validation here
    //TODO2: Process only if the status is "processing"
    const paymentInformation: {
        token: string,
        userId: string,
        amount: string
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    //debug 
    console.log({ userId: paymentInformation.userId, amouunt: paymentInformation.amount, token: paymentInformation.token });

    // Update balance in db, add txn
    try {
        await db.$transaction([
            db.balance.updateMany({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                data: {
                    amount: {
                        increment: Number(paymentInformation.amount)
                    }
                }
            }),

            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Success"
                }
            })
        ])

        res.json({
            msg: "Captured"
        })

    } catch (error) {
        console.error(error);
        res.status(411).json({
            msg: "Error while processing webhook"
        })

    }
})

app.listen(3003);