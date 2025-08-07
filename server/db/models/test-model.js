const mongoose = require('mongoose');

const subtestSchema = new mongoose.Schema({
    _name: {
        type: String,
        trim: true
    },
    _units: {
        type: String,
        trim: true
    },
    _normalRange: {
        type: String,
        trim: true
    }
}, { _id: false });

const TestSchema = new mongoose.Schema({
    _name: {
        type: String,
        required: true,
        trim: true
    },
    _code: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    _description: {
        type: String,
        trim: true
    },
    _category: {
        type: String,
        trim: true
    },
    _price: {
        type: Number,
        required: true,
        min: 0
    },
    _units: {
        type: String,
        trim: true,
        required: true
    },
    _normalRange: {
        type: String,
        trim: true,
        required: true
    },
    _isSubtests: {
        type: Boolean,
        default: false
    },
    _subtests: [subtestSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model('Tests', TestSchema);