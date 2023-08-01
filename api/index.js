import querystring from 'querystring';
import http from 'http';
import configs from './configs.js';
import log from './utils/logger.js';
import utils from './utils/index.js';
import dbManager from './db-manager.js';


const { sendResponseWithHeaders, getRequestPayload } = utils;
import functions from './functions/index.js';
const { setup, table, users, search } = functions;
let port = configs.PORT;
let availableRoutes = [setup, table, users, search];
const requestHandler = async (req, res) => {
    let queryParams = querystring.parse(req.url.split('?')[1]);
    let collectionName = queryParams.action;
    if (!collectionName) {
        return sendResponseWithHeaders(req, res, {
            error: {
                code: 'REQUEST_NOT_FOUND',
                message: 'Request not found'
            }
        });
    }
    if(collectionName !== 'users') {
        if (!req.headers.authorization) {
            return sendResponseWithHeaders(req, res, {
                error: {
                    code: 'INVALID_ACCESS',
                    message: 'Invalid access to this request'
                }
            });
        }
        let token = req.headers.authorization.replace('Bearer ', '');
        let validUser = await utils.jwtDecryption(token);
        if(!validUser) {
            return sendResponseWithHeaders(req, res, {
                error: {
                    code: 'INVALID_ACCESS',
                    message: 'Invalid access to this request'
                }
            });
        }
        req.username = validUser.username;
        req.userid = validUser.userid;
        req.userrole = validUser.userrole;
    }
    if (collectionName === 'table' && !queryParams.tablename) {
        return sendResponseWithHeaders(req, res, {
            error: {
                code: 'QUERYPARAM_MISSING',
                message: 'Required queryparams are missing'
            }
        });
    }
    let routeFound = availableRoutes.find(x => x.name === collectionName);
    if (!routeFound) {
        return sendResponseWithHeaders(req, res, {
            error: {
                code: 'ACTION_NOT_FOUND',
                message: 'Endpoint action not found'
            }
        });
    }
    let method = req.method.toLowerCase();
    let queryMethod = (queryParams.method || '').toLowerCase();
    let methodFound = null;
    if (queryMethod.length > 0) {
        methodFound = routeFound[queryMethod];
        if (!methodFound) {
            return sendResponseWithHeaders(req, res, {
                error: {
                    code: 'ACTION_METHOD_NOT_FOUND',
                    message: 'Action method not found'
                }
            });
        }
    }
    if (methodFound === null) {
        methodFound = routeFound[method];
        if (!methodFound) {
            return sendResponseWithHeaders(req, res, {
                error: {
                    code: 'ACTION_METHOD_NOT_FOUND',
                    message: 'Action method not found'
                }
            });
        }
    }
    if (!dbManager.isConnected()) {
        return sendResponseWithHeaders(req, res, {
            error: {
                code: 'DB_CONNECTION_ERROR',
                message: 'DB disconnected'
            }
        });
    }
    try {
        let dbCollection = dbManager.getDB().collection(collectionName === 'table' ? queryParams.tablename : collectionName);
        req.queryParams = queryParams;
        if (req.queryParams['id']) {
            req.queryParams['id'] = new dbManager.ObjectId(req.queryParams['id']);
        }
        if (method === 'post') {
            const payload = await getRequestPayload(req);
            if (payload) {
                req.body = payload;
            } else {
                return sendResponseWithHeaders(req, res, {
                    error: {
                        code: 'PAYLOAD_ERROR',
                        message: 'Request payload error'
                    }
                });
            }
        }
        let routeParams = {
            req,
            res,
            dbCollection,
            collectionName,
            db: dbManager.getDB()
        };
        return methodFound(routeParams);
    } catch (ex) {
        log({}, { exception: err }, 'Http request error with exception');
        return sendResponseWithHeaders(req, res, {
            error: {
                code: 'HTTP_REQUEST_ERROR',
                message: 'Http request error with exception'
            }
        });
    }
};
const initHttpServer = () => {
    return new Promise((res, rej) => {
        try {
            const httpServer = http.createServer(requestHandler).listen(port, () => {
                log({}, {}, `Http server started at *:${port}`);
                res(httpServer);
            });
        } catch (err) {
            log({}, { exception: err }, 'Http server failed to start', err);
            res();
        }
    });

};
const startServer = async () => {
    await dbManager.init();
    await initHttpServer();

};

startServer().then(() => {
    log({}, {}, 'All are ready now for server');
}).catch(err => {
    log({}, { exception: err }, 'Server failed to start');
});
