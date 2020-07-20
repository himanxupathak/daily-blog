require("dotenv").config();
dbPassword = 'mongodb+srv://himanshu:' + encodeURIComponent(process.env.MONGODB_PASS) + '@cluster0-piybb.mongodb.net/test?retryWrites=true&w=majority';
module.exports = {
    mongoURI: dbPassword
}