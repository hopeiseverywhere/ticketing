import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import Router from 'next/router';
import UseRequestHook from "../../hooks/use-request-hook";

const OrderShow = ({ order, currentUser }) => {
    // calculates seconds left every second
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = UseRequestHook({
        url: "/api/payments",
        method: "post",
        body: { 
            orderId: order.id 
        },
        onSuccess: () => Router.push("/orders"),
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, [order]);

    // expire the order
    if (timeLeft < 0) {
        return <div>Order Expired</div>;
    }

    return (
        <div>
            Time left to pay: {timeLeft} seconds
            <StripeCheckout
                token={(id) => doRequest({ token: id })}
                stripeKey="pk_test_51PPBtM04PJgrgaxRrmRQNR1Bt6ewgZyoOgvGm5qe8A2NRJKllHHHEnTs23bG4N3tnLUVvvGL6NeVZ6THpvSmEqZI00BiwfdBNj"
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}
        </div>
    );
};

OrderShow.getInitialProps = async (context, client) => {
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
};

export default OrderShow;
