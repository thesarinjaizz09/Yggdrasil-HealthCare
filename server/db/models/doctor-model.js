const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    _name: {
        type: String,
        required: true,
        trim: true
    },
    _degree: {
        type: String,
        required: true,
        trim: true
    },
    _signatureImage: {
        type: String, // Store image as a URL or base64 string
        required: true
    },
    _contactNumber: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Doctors', DoctorSchema);