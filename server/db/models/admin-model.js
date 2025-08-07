//Importing all the required packages

const mongoose = require('mongoose'); // Importing mongoose for connecting to mongoDB

const AdminSchema = new mongoose.Schema({
    _name: {
        type: String,
        required: true,
        trim: true
    },
    _email: {
        type: String,
        required: true,
        unique: true
    },
    _password: {
        type: String,
        required: true,
        trim: true
    },
    _loginTime: {
        type: String,
        default: "00:00 AM",
        trim: true
    },
    _logoutTime: {
        type: String,
        default: "00:00 AM",
        trim: true
    }
}, {
    timestamps: true,
    timeseries: true
});

module.exports = mongoose.model('Admins', AdminSchema);

