// load up automatically by next js
// whenever the project starts iup
module.exports = {
    // webpack config
    // tell webpack rather than trying watch for file changes
    // pull all different files inside of our project dir 
    // automatically every 3000 milliseconds
    webpack: (config) => {
        config.watchOptions.poll = 300;
        return config;
    },
};
