const request = require('supertest');
const app = require('../app');
const Employee = require('../models/emp');
const jwt = require('jsonwebtoken');

jest.mock('../models/emp');

process.env.JWT_SECRET = 'test_secret';
const testToken = jwt.sign({ id: 'userid123', username: 'testuser' }, 'test_secret');

describe('Employee Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/employees/add', () => {
        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/employees/add')
                .send({ fullName: 'John Doe' });
            expect(res.statusCode).toEqual(401);
        });

        it('should add an employee successfully when authenticated', async () => {
            const mockEmpData = {
                fullName: 'John Doe',
                email: 'john@example.com',
                mobile: '1234567890',
                department: 'IT',
                designation: 'Developer',
                joiningDate: '2026-06-20'
            };

            Employee.mockImplementation((data) => ({
                ...data,
                save: jest.fn().mockResolvedValue(true)
            }));

            const res = await request(app)
                .post('/api/employees/add')
                .set('Authorization', `Bearer ${testToken}`)
                .send(mockEmpData);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'Employee added successfully');
            expect(res.body).toHaveProperty('employee');
            expect(res.body.employee).toHaveProperty('fullName', 'John Doe');
        });

        it('should return 400 on validation error', async () => {
            const validationError = new Error('ValidationError');
            validationError.name = 'ValidationError';
            validationError.errors = {
                email: { message: 'Email is required' }
            };

            Employee.mockImplementation(() => ({
                save: jest.fn().mockRejectedValue(validationError)
            }));

            const res = await request(app)
                .post('/api/employees/add')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ fullName: 'John Doe' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Email is required');
        });
    });

    describe('GET /api/employees', () => {
        it('should fetch employees list', async () => {
            const mockEmps = [
                { _id: '1', fullName: 'Alice' },
                { _id: '2', fullName: 'Bob' }
            ];

            const mockSort = jest.fn().mockResolvedValue(mockEmps);
            Employee.find.mockReturnValue({ sort: mockSort });

            const res = await request(app)
                .get('/api/employees')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body).toHaveLength(2);
            expect(Employee.find).toHaveBeenCalledWith({ isDeleted: { $ne: true } });
        });

        it('should support search name parameter', async () => {
            const mockSort = jest.fn().mockResolvedValue([]);
            Employee.find.mockReturnValue({ sort: mockSort });

            await request(app)
                .get('/api/employees?search=Alice')
                .set('Authorization', `Bearer ${testToken}`);

            expect(Employee.find).toHaveBeenCalledWith({
                isDeleted: { $ne: true },
                fullName: { $regex: 'Alice', $options: 'i' }
            });
        });
    });

    describe('PUT /api/employees/:id', () => {
        it('should update employee data successfully', async () => {
            const updatedEmp = { _id: 'emp123', fullName: 'Updated Name' };
            Employee.findOneAndUpdate.mockResolvedValue(updatedEmp);

            const res = await request(app)
                .put('/api/employees/emp123')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ fullName: 'Updated Name' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Employee updated successfully');
            expect(res.body.employee).toHaveProperty('fullName', 'Updated Name');
        });

        it('should return 404 if employee to update is not found', async () => {
            Employee.findOneAndUpdate.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/employees/unknown')
                .set('Authorization', `Bearer ${testToken}`)
                .send({ fullName: 'Updated Name' });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Employee not found');
        });
    });

    describe('DELETE /api/employees/:id', () => {
        it('should soft delete employee successfully', async () => {
            const deletedEmp = { _id: 'emp123', isDeleted: true };
            Employee.findOneAndUpdate.mockResolvedValue(deletedEmp);

            const res = await request(app)
                .delete('/api/employees/emp123')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Employee deleted successfully');
        });

        it('should return 404 if employee to delete is not found', async () => {
            Employee.findOneAndUpdate.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/employees/unknown')
                .set('Authorization', `Bearer ${testToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Employee not found');
        });
    });
});
