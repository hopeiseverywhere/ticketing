import { useState } from "react";
import Router from "next/router";
import UseRequestHook from "../../hooks/use-request-hook";

const NewTicket = () => {
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    // tying the front-end form with the back-end POST request
    const { doRequest, errors } = UseRequestHook({
        url: "/api/tickets",
        method: "post",
        body: {
            title,
            price,
        },
        // send user back to root route "/"
        onSuccess: () => Router.push("/"),
    });

    const onSubmit = (event) => {
        event.preventDefault();
        doRequest();
    };

    const onBlur = () => {
        // no decimal points
        const value = parseFloat(price);
        // skip none
        if (isNaN(value)) {
            return;
        }
        // 2 decima points
        setPrice(value.toFixed(2));
    };
    return (
        <div>
            <h1>
                Create A Ticket
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Price</label>
                        <input
                            value={price}
                            onBlur={onBlur}
                            onChange={(e) => setPrice(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    {errors}
                    <button className="btn btn-primary">Submit</button>
                </form>
            </h1>
        </div>
    );
};

export default NewTicket;
