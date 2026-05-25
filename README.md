# User Management REST API

A production-ready REST API for user management built with Node.js, Express.js, and MySQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Password Hashing**: bcrypt
- **Environment Management**: dotenv
- **File Storage**: Supabase Storage

## Project Structure

```
kios_backend/
├── config/
│   └── database.js          # MySQL connection configuration
├── controllers/
│   └── userController.js    # Business logic for user operations
├── models/
│   └── userModel.js         # Database queries and operations
├── routes/
│   └── userRoutes.js        # API endpoint definitions
├── middleware/
│   ├── errorHandler.js      # Global error handling middleware
│   └── validateUserInput.js # Request validation middleware
├── app.js                   # Main application entry point
├── package.json             # Project dependencies
├── .env.example             # Environment variables template
└── .gitignore              # Git ignore rules
```

## Features

- ✅ Create new users with password hashing
- ✅ Retrieve all users with pagination support
- ✅ Get user by ID
- ✅ Update user information
- ✅ Delete user
- ✅ Email uniqueness validation
- ✅ Password hashing with bcrypt
- ✅ Comprehensive error handling
- ✅ Request validation
- ✅ JSON responses with proper HTTP status codes
- ✅ Environment-based configuration

## API Endpoints

### Create User
- **POST** `/api/users`
- **Body**: 
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "address": "123 Main St",
    "photo_profile": "url_to_photo"
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "address": "123 Main St",
      "photo_profile": "url_to_photo"
    }
  }
  ```

### Get All Users
- **GET** `/api/users`
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "address": "123 Main St",
        "photo_profile": "url_to_photo",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "count": 1
  }
  ```

### Get User by ID
- **GET** `/api/users/:id`
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "User retrieved successfully",
    "data": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "address": "123 Main St",
      "photo_profile": "url_to_photo",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
  ```

### Update User
- **PUT** `/api/users/:id`
- **Body** (all fields optional):
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "newpassword123",
    "address": "456 Oak Ave",
    "photo_profile": "new_url"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "data": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "address": "456 Oak Ave",
      "photo_profile": "new_url"
    }
  }
  ```

### Delete User
- **DELETE** `/api/users/:id`
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "User deleted successfully",
    "data": {
      "id": 1
    }
  }
  ```

### Health Check
- **GET** `/api/health`
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Server is running"
  }
  ```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd kios_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create MySQL database and table**
   ```sql
   CREATE DATABASE kios_db;
   
   USE kios_db;
   
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(150) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL,
       address TEXT,
       photo_profile VARCHAR(255),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your MySQL credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=kios_db
     DB_PORT=3306
     PORT=3000
     NODE_ENV=development
     PUBLIC_BACKEND_URL=http://localhost:3000
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_KEY=your-supabase-service-role-key
     SUPABASE_BUCKET=product-images
     ```

   - Pastikan bucket Supabase yang dipakai bersifat public jika URL gambar ingin langsung dipakai dari database.
   - `PUBLIC_BACKEND_URL` dipakai untuk data lama yang masih menyimpan path relatif seperti `/uploads/...`.

5. **Start the server**
   
   Development (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production:
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000`

## Validation Rules

- **Name**: Required, non-empty string
- **Email**: Required, valid email format, must be unique
- **Password**: Required for creation, minimum 6 characters, automatically hashed
- **Address**: Optional text field
- **Photo Profile**: Optional URL field

## Error Handling

The API returns appropriate HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **404**: Not Found
- **409**: Conflict (email already exists)
- **500**: Internal Server Error

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Passwords never returned in API responses
- ✅ Email uniqueness validation
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (prepared statements)
- ✅ Environment-based configuration

## Database Queries Reference

### Insert User
```sql
INSERT INTO users (name, email, password, address, photo_profile, created_at, updated_at)
VALUES ('John Doe', 'john@example.com', 'hashed_password', '123 Main St', 'url', NOW(), NOW());
```

### Select All Users
```sql
SELECT id, name, email, address, photo_profile, created_at, updated_at
FROM users
ORDER BY created_at DESC;
```

### Select User by ID
```sql
SELECT id, name, email, address, photo_profile, created_at, updated_at
FROM users
WHERE id = 1;
```

### Update User
```sql
UPDATE users
SET name = 'Jane Doe', email = 'jane@example.com', address = '456 Oak Ave', updated_at = NOW()
WHERE id = 1;
```

### Delete User
```sql
DELETE FROM users WHERE id = 1;
```

## Dependencies

- **express**: Web application framework
- **mysql2**: MySQL database driver
- **bcrypt**: Password hashing library
- **dotenv**: Environment variable management
- **nodemon**: Development tool for auto-reload

## Development

For development, use:
```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts the server when files change.

## License

ISC
