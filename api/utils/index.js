import { ObjectId } from 'mongodb';
const jwtKey = 'sdfafjsdfisdf8sdfsdlfhdsfiu7dsfsdfsdfdsfsdfsdfsd9fsdfsdf8sdf0';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import configs from '../configs.js';
const algorithm = 'aes-256-ctr';
const secretKey = crypto.createHash('sha256').update(String(jwtKey)).digest('base64').substring(0, 32);
const iv = crypto.randomBytes(16);
const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};
const decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

const jwtEncryption = (dataToEncrypt, expirationInMinutes) => {
    // let jwtData = encrypt(JSON.stringify(dataToEncrypt));
    let jwtData = dataToEncrypt;
    return jwt.sign(jwtData, jwtKey, {
        algorithm: 'HS384',
        expiresIn: (expirationInMinutes || configs.NO_OF_MINUTES) * 60
    });
};
const jwtDecryption = (dataToDecrypt) => {
    let decryptedData = null;

    try {
        let payload = jwt.verify(dataToDecrypt, jwtKey);
        // let decryptedText = decrypt(payload);
        // decryptedData = JSON.parse(decryptedText);
        decryptedData = payload;
    } catch (e) {
        // console.log('decrypt error: ', e);
    }
    return decryptedData;
}
const sendResponseWithHeaders = (req, res, { onlyHeaders = false, status, contentType, contentSize, data, error }) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-KEY');
    res.setHeader('Access-Control-Allow-Credentials', true);
    var resHeaders = {
        'Content-Type': contentType || 'application/json'
    };
    if (contentSize) {
        resHeaders['Content-Length'] = contentSize;
    }
    res.writeHead(status || 200, resHeaders);
    if (!onlyHeaders) {
        res.write(JSON.stringify({
            data,
            error
        }));
        return res.end();
    }
};
const utils = {
    encrypt,
    decrypt,
    jwtEncryption,
    jwtDecryption,
    methods: {
        async get(args) {
            let {
                req, res, dbCollection,
                collectionName
            } = args;
            const items = await dbCollection.find({}, {
                "sort": {
                    "createdAt": -1
                }
            }).toArray();
            return sendResponseWithHeaders(req, res, {
                status: 200,
                data: items
            });
        },
        async post(args) {
            let {
                req, res, dbCollection,
                collectionName
            } = args;
            let itemToAdd = req.body;
            if (itemToAdd && itemToAdd.id) {
                let updateData = { ...itemToAdd };
                delete updateData.id;
                updateData['updatedAt'] = new Date();
                updateData['updatedBy'] = req.userid;
                let updateResp = await dbCollection.updateOne({ _id: itemToAdd.id }, {
                    $set: {
                        ...updateData
                    }
                });
                return sendResponseWithHeaders(req, res, {
                    status: 200,
                    data: updateResp
                });
            } else {
                if(itemToAdd.items) {
                    itemToAdd.items.forEach(item => {
                        item['createdAt'] = new Date();
                        item['createdBy'] = req.userid;
                    });
                    let insertResp = await dbCollection.insertMany(itemToAdd.items);
                    return sendResponseWithHeaders(req, res, {
                        status: 200,
                        data: insertResp
                    });
                } else {
                    itemToAdd['createdAt'] = new Date();
                    itemToAdd['createdBy'] = req.userid;
                    let insertResp = await dbCollection.insertOne(itemToAdd);
                    return sendResponseWithHeaders(req, res, {
                        status: 200,
                        data: insertResp
                    });
                }
            }
        },
        async delete(args) {
            let {
                req, res, dbCollection,
                collectionName
            } = args;
            if (req.queryParams && req.queryParams.id) {
                const deleteResult = await dbCollection.deleteMany({ _id: req.queryParams.id });
                return utils.sendData(req, res, {
                    data: deleteResult
                });
            }
            return sendResponseWithHeaders(req, res, {
                status: 200,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Records not found'
                }
            });
        },
        async filter(args) {
            let {
                req, res, dbCollection,
                collectionName
            } = args;
            let filterData = req.body;
            if (filterData && filterData.find && filterData.find.id) {
                filterData.find._id = new ObjectId(filterData.find.id);
                delete filterData.find.id;
            }
            const items = await dbCollection.find(filterData.find, filterData.options).toArray();
            return sendResponseWithHeaders(req, res, { data: items });
        }
    },
    sendResponseWithHeaders,
    guid(len) {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        if (len == 8) {
            return s4() + s4();
        }
        switch (len) {
            case 4:
                return s4();
                break;
            case 8:
                return s4() + s4();
                break;
            case 12:
                return s4() + s4() + s4();
                break;
        }
        return s4() + s4() + s4() + s4() + s4() + s4() + (new Date).getTime().toString(16);
    },
    async getRequestPayload(req, isPlainBody = false) {
        return new Promise((res, rej) => {
            const chunks = [];
            req.on("data", (chunk) => {
                chunks.push(chunk);
            });
            req.on("end", () => {
                const data = Buffer.concat(chunks);
                const stringData = data.toString();
                if (isPlainBody) {
                    res(stringData);
                } else {
                    try {
                        res(JSON.parse(stringData));
                    } catch (ex) {
                        res();
                    }
                }
            });
            req.on('error', () => {
                res();
            });
        });
    }
};
export default utils;