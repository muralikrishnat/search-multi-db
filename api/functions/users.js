import utils from '../utils/index.js';
let { sendResponseWithHeaders, jwtEncryption, jwtDecryption } = utils;
export default {
    name: "users",
    ...utils.methods,
    async register(args) {
        let {
            req,
            res,
            dbCollection,
            db
        } = args;
        let userToRegister = req.body;
        let { username, password } = userToRegister;
        if (!(username && password && username.length > 1 && password.length > 1)) {
            return sendResponseWithHeaders(req, res, {
                status: 200,
                error: {
                    code: 'INPUT_VALIDATION_ERROR',
                    message: 'username and password are required with minimum two characters'
                }
            });
        }
        userToRegister["password"] = utils.encrypt(password);
        userToRegister["role"] = "USER";
        let userId = utils.guid();
        userToRegister["id"] = userId;
        userToRegister["userId"] = userId;
        let userResp = await db.collection('users').find({
            username: username
        }).toArray();
        if (userResp.length > 0) {
            return sendResponseWithHeaders(req, res, {
                status: 200,
                error: {
                    code: 'DB_ERROR',
                    message: 'username already exists'
                }
            });

        }
        let registerResp = await db.collection('users').insertOne(userToRegister);
        if (registerResp.insertedCount === 0) {
            return sendResponseWithHeaders(req, res, {
                status: 200,
                error: {
                    code: 'DB_ERROR',
                    message: 'unable to register user'
                }
            });
        }
        return sendResponseWithHeaders(req, res, {
            status: 200,
            data: {
                status: true,
                isValid: true,
                token: utils.jwtEncryption({
                    userId: userToRegister.userId || userToRegister.id,
                    username: username,
                    role: userToRegister.role
                }),
                validByRegistration: true
            }
        });
    },
    async authenticate(args) {
        let {
            req,
            res,
            dbCollection,
            db
        } = args;
        if (req.headers.authorization) {
            let token = req.headers.authorization.split(' ')[1];
            let decoded = utils.jwtDecryption(token);
            if (decoded) {
                let userResp = await db.collection('users').find({ username: decoded.username }).toArray();
                if (userResp && userResp.length > 0) {
                    let userItem = userResp[0];
                    delete userItem['password'];
                    return sendResponseWithHeaders(req, res, {
                        status: 200,
                        data: {
                            isValid: true,
                            token: utils.jwtEncryption({
                                userId: userItem.userId || userItem.id,
                                username: userItem.username,
                                role: userItem.role
                            }),
                            validByToken: true
                        }
                    });
                }
            }
        }
        let userToAuthenticate = req.body;
        let { username, password } = userToAuthenticate;
        if (!(username && password && username.length > 1 && password.length > 1)) {
            return sendResponseWithHeaders(req, res, {
                status: 200,
                error: {
                    code: 'INPUT_VALIDATION_ERROR',
                    message: 'username and password are required with minimum two characters'
                }
            });
        }
        let userResp = await db.collection('users').find({
            username: username
        }).toArray();
        if (userResp.length === 0) {
            return sendResponseWithHeaders(req, res, {
                status: 200,
                error: {
                    code: 'INVALID_CREDS',
                    message: 'username and password do not match'
                }
            });
        }
        let user = userResp[0];
        let decryptedPassword = utils.decrypt(user.password);
        if (decryptedPassword !== password) {
            return sendResponseWithHeaders(req, res, {
                status: 200,
                error: {
                    code: 'INVALID_CREDS',
                    message: 'username and password do not match'
                }
            });
        }
        return sendResponseWithHeaders(req, res, {
            status: 200,
            data: {
                isValid: true,
                token: utils.jwtEncryption({
                    userId: user.userId || user.id,
                    username: username,
                    role: user.role
                }),
                validByCreds: true
            }
        });
    },
    async logout(args) {

    }
}