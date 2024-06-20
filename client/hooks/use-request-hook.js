import axios from "axios";
import { useState } from "react";

const UseRequestHook = ({ url, method, body, onSuccess }) => {
    // method === 'post', 'get', 'patch'
    const [errors, setErrors] = useState(null);

    const doRequest = async (props = {}) => {
        try {
            // reset error state
            setErrors(null);
            const response = await axios[method](url, { ...body, ...props });
            // if req occurs successfully
            if (onSuccess) {
                onSuccess(response.data);
            }
            // take the data out of this response
            return response.data;
        } catch (err) {
            // otherwise turn the err to a JSX block
            setErrors(
                <div className="alert alert-danger">
                    <h4>Ooops....</h4>
                    <ul className="my-0">
                        {err.response.data.errors.map((err) => (
                            <li key={err.message}>{err.message}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    };
    return { doRequest, errors };
};

export default UseRequestHook;
