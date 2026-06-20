const express = require('express');
const router = express.Router();
const Employee = require('../models/emp');
const auth = require('../middleware/authmiddleware');

// Add Employee
router.post('/add', auth, async (req, res) => {
    try {
        const newEmp = new Employee(req.body);
        await newEmp.save();
        res.status(201).json({ message: "Employee added successfully", employee: newEmp });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: "An employee with this email already exists" });
        }
        res.status(500).json({ message: err.message });
    }
});

// View Employee List (with search functionality and soft-delete filtering)
router.get('/', auth, async (req, res) => {
    try {
        const { search } = req.query;
        let query = { isDeleted: { $ne: true } };
        if (search) {
            query.fullName = { $regex: search, $options: 'i' };
        }
        const emps = await Employee.find(query).sort({ createdAt: -1 });
        res.json(emps);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Employee
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedEmp = await Employee.findOneAndUpdate(
            { _id: req.params.id, isDeleted: { $ne: true } },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedEmp) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json({ message: "Employee updated successfully", employee: updatedEmp });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: "An employee with this email already exists" });
        }
        res.status(500).json({ message: err.message });
    }
});

// Delete Employee (Soft Delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedEmp = await Employee.findOneAndUpdate(
            { _id: req.params.id, isDeleted: { $ne: true } },
            { isDeleted: true },
            { new: true }
        );
        if (!deletedEmp) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json({ message: "Employee deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;