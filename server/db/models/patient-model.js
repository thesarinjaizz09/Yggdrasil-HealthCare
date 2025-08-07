const mongoose = require('mongoose');

const subtestSchema = new mongoose.Schema({
    _name: {
        type: String,
        required: true,
        trim: true
    },
    _units: {
        type: String,
        trim: true
    },
    _result: {
        type: String,
        trim: true
    },
    _normalRange: {
        type: String,
        trim: true
    },
    _isCompleted: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const testSchema = new mongoose.Schema({
    _name: { type: String, required: true },
    _code: { type: String },
    _price: { type: Number, required: true },
    _units: {
        type: String,
        trim: true
    },
    _normalRange: {
        type: String,
        trim: true
    },
    _result: {
        type: String,
        trim: true
    },
    _isSubtests: {
        type: Boolean,
        default: false
    },
    _subtests: [subtestSchema],
    _isCompleted: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const PatientSchema = new mongoose.Schema({
    _name: { type: String, required: true, trim: true },
    _gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    _dateOfBirth: { type: Date, required: true },
    _contactNumber: { type: Number, required: true },
    _address: { type: String, trim: true },
    _emergencyContact: {
        name: String,
        relation: String,
        phone: Number
    },
    _bloodGroup: { type: String, trim: true },
    _registrationDate: { type: Date, default: Date.now },
    _testCompletionDate: { type: String, default: '' },
    _referDoctor: { type: String, trim: true },
    _testDoctor: { type: String, trim: true },
    _isActive: { type: Boolean, default: true },
    _prescribedTests: [testSchema],
    _totalPrice: { type: Number, default: 0 },
    _isAllTestCompleted: { type: Boolean, default: false }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Patients', PatientSchema);