import { ObjectId } from 'mongodb';
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
                itemToAdd['createdAt'] = new Date();
                let insertResp = await dbCollection.insertOne(itemToAdd);
                return sendResponseWithHeaders(req, res, {
                    status: 200,
                    data: insertResp
                });
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