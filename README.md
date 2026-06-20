# Corporate Employee Management System (EMS Pro)

A secure, responsive, and visually stunning full-stack Employee Management System built using the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. This system allows administrators to manage employee details, search records, view headcounts, and dynamically track organizational stats in a premium, scroll-locked dashboard.

---

## Key Features

- **TypeScript Migration**: Frontend fully migrated to TypeScript (`.ts` and `.tsx` file types) to guarantee complete compile-time type-safety.
- **Client-Side Sorting**: Instantly sort records in the dashboard by clicking headers for `Full Name`, `Department`, `Designation`, and `Joining Date` with live sorting indicators (`▲` / `▼`).
- **Page-Based Pagination**: Break down list elements into paginated blocks of `5` items per page, featuring a details count label and interactive controls (Previous, Next, and specific page buttons).
- **JWT Authentication**: Secure user registration and login with token-based session tracking (24h expiry).
- **Strong Password Rules**: Client and server-side password validation enforcing a minimum of 6 characters, uppercase, lowercase, numbers, and symbols.
- **Scroll-locked Dashboard View**: Sleek, app-like desktop layout featuring fully fixed sidebars and headers with scrollable content containers that hide visual browser scrollbars (`no-scrollbar`).
- **Dynamic Stats Board**: Live organizational statistics (total headcount and department-wise employee counts) computed dynamically from active databases.
- **Compact Forms Grid**: Elegant 2-column grid popup form structured in 3 rows that fits on a single screen without needing vertical scrollbars.
- **Soft Delete Integration**: Employees deleted are safely flagged in MongoDB (`isDeleted: true`) and filtered out of active queries instead of hard removing records.
- **Dropdown Selections**: Multi-select dropdown menus for departments (IT, HR, Finance, etc.) and designations (Intern, Developer, Manager, etc.) with selectable placeholders.
- **Interactive Alerts**: Temporary fading confirmation alerts (welcome back banners, logout notices, CRUD success notifications).
- **Serial Number Listing**: Automatic dynamic index column (`S.No`) at the beginning of the employee registry.

---

## Technology Stack

- **Frontend**: React.js, Vite, TypeScript, React Router v6, Axios, Custom CSS (Design Tokens, Glassmorphism, Micro-animations)
- **Backend**: Node.js, Express.js, Jest, Supertest, JWT, Bcrypt
- **Database**: MongoDB (Mongoose Object Modeling)

---

## Environment Variables

Create a `.env` file in the `/backend` directory and add the following configurations:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/employee_db
JWT_SECRET=your_super_secret_key_123
```

- `PORT`: The network port on which the Express server runs (default: `5000`).
- `MONGO_URI`: The MongoDB connection string.
- `JWT_SECRET`: A secret key used to sign and verify JSON Web Tokens.

---

## Project Setup Instructions

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas account)

### 2. Clone the Repository
```bash
git clone https://github.com/Aditya-20071977/Employee_Management_System.git
cd Employee_Management_System
```

### 3. Backend Setup & Testing
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend unit tests (uses Jest and Supertest with database mocking):
   ```bash
   npm test
   ```
4. Run the backend server:
   ```bash
   # Development hot-reload
   npm run dev
   
   # Or start normally
   npm start
   ```
   The backend will start running at `http://localhost:5000`.

### 4. Frontend Setup, Type-checking, & Testing
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the frontend unit/component tests (uses Vitest, React Testing Library, and jsdom):
   ```bash
   npm test
   ```
4. Build and type-check the frontend:
   ```bash
   npm run build
   ```
5. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will start running locally at `http://localhost:5173`.

---

## API Documentation

All endpoints are prefixed with `/api`.

### 1. Authentication Module

#### Register User
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "Password123!"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```

#### Login User
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "603d3f...",
      "username": "admin"
    }
  }
  ```

---

### 2. Employee Management Module
*Note: All endpoints below require a valid JWT token passed in the `Authorization` header as `Bearer <token>`.*

#### Add Employee
- **Endpoint**: `POST /employees/add`
- **Access**: Protected (JWT required)
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane.doe@company.com",
    "mobile": "+1234567890",
    "department": "IT",
    "designation": "Developer",
    "joiningDate": "2026-06-20"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Employee added successfully",
    "employee": { ... }
  }
  ```

#### Get Employees List
- **Endpoint**: `GET /employees`
- **Access**: Protected (JWT required)
- **Query Parameters**: `?search=Name` (Optional. Performs a regex case-insensitive search by employee full name).
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "603d4...",
      "fullName": "Jane Doe",
      "email": "jane.doe@company.com",
      "mobile": "+1234567890",
      "department": "IT",
      "designation": "Developer",
      "joiningDate": "2026-06-20T00:00:00.000Z",
      "isDeleted": false
    }
  ]
  ```

#### Update Employee Details
- **Endpoint**: `PUT /employees/:id`
- **Access**: Protected (JWT required)
- **Request Body**: (Provide fields you wish to modify)
  ```json
  {
    "designation": "Team Lead"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Employee updated successfully",
    "employee": { ... }
  }
  ```

#### Delete Employee (Soft Delete)
- **Endpoint**: `DELETE /employees/:id`
- **Access**: Protected (JWT required)
- **Response (200 OK)**:
  ```json
  {
    "message": "Employee deleted successfully"
  }
  ```