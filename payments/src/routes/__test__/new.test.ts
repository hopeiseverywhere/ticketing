import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order, OrderAttrs } from "../../models/order";
import { OrderStatus } from "@fran-tickets/common";
import { stripe } from "../../stripe";
import { Payment, PaymentAttrs } from "../../models/payment";


it("returns a 404 when purchasing an order that does not exist", async () => {
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: "asldkfj",
            orderId: new mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

// it("creates a payment with Payment.build()", () => {
//     const attrs: PaymentAttrs = {
//         orderId: new mongoose.Types.ObjectId().toHexString(),
//         stripeId: "stripe_test_id",
//     };

//     const payment = Payment.build(attrs);

//     expect(payment.orderId).toEqual(attrs.orderId);
//     expect(payment.stripeId).toEqual(attrs.stripeId);
// });

// it("creates an order with Order.build()", () => {
//     const attrs: OrderAttrs = {
//         id: new mongoose.Types.ObjectId().toHexString(),
//         status: OrderStatus.Created,
//         userId: "testuser",
//         price: 20,
//         version: 0,
//     };

//     const order = Order.build(attrs);

//     expect(order.id).toEqual(attrs.id);
//     expect(order.status).toEqual(attrs.status);
//     expect(order.userId).toEqual(attrs.userId);
//     expect(order.price).toEqual(attrs.price);
//     expect(order.version).toEqual(attrs.version);
// });

it("returns a 401 when purchasing an order that doesn't belong to the user", async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: "asldkfj",
            orderId: order.id,
        })
        .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin(userId))
        .send({
            orderId: order.id,
            token: "asdlkfj",
        })
        .expect(400);
});

it("returns a 201 with valid inputs", async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin(userId))
        .send({
            token: "tok_visa",
            orderId: order.id,
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge?.currency).toEqual("usd");

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id,
    });
    expect(payment).not.toBeNull();
});
