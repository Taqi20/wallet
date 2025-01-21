import express from "express";
import db from "@repo/db/client";

const app = express();

app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here?
    const paymentInformation = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };
    // Update balance in db, add txn
    try {
        await db.$transaction([
            db.balance.update({
                where: {
                    userId: paymentInformation.userId
                },
                data: {
                    amount: {
                        increment: paymentInformation.amount
                    }
                }
            }),

            db.onRampTransaction.update({
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