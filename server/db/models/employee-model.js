//Importing all the required packages

const mongoose = require('mongoose'); // Importing mongoose for connecting to mongoDB
import generate__url from '../../utils/connection-url-generator';

const employeeAttendanceSchema = new mongooseSchema({
    _date: {
        type: String,
        default: '01',
        trim: true
    },
    _month: {
        type: String,
        default: '01',
        trim: true
    },
    _year: {
        type: String,
        default: '2025',
        trim: true
    },
    _status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present'
    },
    _inTime: {
        type: String,
        default: '00:00 AM',
        trim: true
    },
    _outTime: {
        type: String,
        default: '00:00 AM',
        trim: true
    },
    _workingHours: {
        type: String,
        default: '00 Hrs',
        trim: true
    }
}, {
    timestamps: true,
    timeseries: true,
    _id: false
});

const EmployeeSchema = new mongooseSchema({
    _name: {
        type: String,
        required: true,
        trim: true
    },
    _email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    _password: {
        type: String,
        required: true,
        trim: true
    },
    _number: {
        type: String,
        required: true,
        trim: true
    },
    _employeeId: {
        type: String,
        default: generate__url(6),
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
    },
    _accountNumber: {
        type: String,
        trim: true
    },
    _ISFC: {
        type: String,
        trim: true
    },
    _bankingName: {
        type: String,
        trim: true
    },
    _bank: {
        type: String,
        trim: true
    },
    _employeeAttendance: [employeeAttendanceSchema]
}, {
    timestamps: true,
    timeseries: true
});

module.exports = mongoose.model('Employees', EmployeeSchema);
