const request = require('supertest');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcrypt');

jest.mock('../models/user');
jest.mock('bcrypt');

process.env.JWT_SECRET = 'test_secret';

describe('Auth Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            User.findOne.mockResolvedValue(null);
            User.prototype.save = jest.fn().mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', password: 'Password123!' });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
        });

        it('should fail if fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Username and password are required');
        });

        it('should fail if username already exists', async () => {
            User.findOne.mockResolvedValue({ username: 'testuser' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', password: 'Password123!' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });

        it('should fail on weak password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', password: '123' });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toContain('Password must be at least 6 characters');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully and return jwt token', async () => {
            const mockUser = {
                _id: 'userid123',
                username: 'testuser',
                password: 'hashedpassword'
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'testuser', password: 'Password123!' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('username', 'testuser');
        });

        it('should fail with invalid username', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'unknown', password: 'Password123!' });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid username or password');
        });

        it('should fail with invalid password', async () => {
            const mockUser = {
                _id: 'userid123',
                username: 'testuser',
                password: 'hashedpassword'
            };
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ username: 'testuser', password: 'WrongPassword!' });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid username or password');
        });
    });
});
