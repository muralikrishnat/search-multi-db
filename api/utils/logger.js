const log = (logOpts, logData, ...msg) => {
    let { level, color } = logOpts;
    if(logData && logData.exception) {
        console.log('ERROR: ', logData.exception);
        return;
    }
    console.log(...msg);
};
export default log;