export default {
    PORT: process.env.PORT || 3434,
    MONGODB: {
        HOST: process.env.MONGO_HOST || 'mongodb://127.0.0.1:27017',
        BD_NAME: process.env.SEARCH_DB_NAME || 'seardbmanager' 
    }
};