import axios from 'axios';

const BuildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // We are on the server
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            // pass along the headers from the incoming request
            headers: req.headers,
        });
    } else {
        // We must be on the browser
        return axios.create({
            baseURL: '/',
        });
    }
};

export default BuildClient;
