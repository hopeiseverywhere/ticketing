import { useState } from 'react';
// navigate user around
import Router from 'next/router';
// custom hook
import UseRequestHook from '../../hooks/use-request-hook';

const SignUp = () => {
    // State variables to manage the email and password input fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = UseRequestHook({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email,
            password
        },
        // callback that will be invoked any time that we make a request successfully
        // router user
        onSuccess: () => Router.push('/')
    });


    // Function to handle form submission
    const onSubmit = async (event) => {
        event.preventDefault();
        

        await doRequest();
    };
    // JSX for the sign-up form
    return (
        <form onSubmit={onSubmit}>
            <h1>Sign Up v1</h1>
            <div className="from-group">
                <label>Email Address</label>
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="from-control"
                />
            </div>
            <div className="from-group">
                <label>Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="from-control"
                />
            </div>
            {errors}
            <button className="btn btn-primary">Sign Up</button>
        </form>
    );
};
export default SignUp;
