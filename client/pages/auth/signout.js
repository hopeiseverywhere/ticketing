import { useEffect } from "react";
import Router from 'next/router';
import UseRequestHook from "../../hooks/use-request-hook";

const SignOut = () => {
    const { doRequest } = UseRequestHook({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    });

    useEffect(() => {
        doRequest();
    }, []);

    return
    <div>
        Signing you out....
    </div>
}
export default SignOut;
