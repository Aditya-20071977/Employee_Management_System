const mongoose = require('mongoose');

const empSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true,
        match: [/^[0-9\-\+\s]{10,15}$/, 'Please fill a valid mobile number (10 to 15 digits/characters)']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    designation: {
        type: String,
        required: [true, 'Designation is required'],
        trim: true
    },
    joiningDate: {
        type: Date,
        required: [true, 'Joining date is required'],
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', empSchema);