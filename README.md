# CSCI-201 Project

Full-stack web application with React frontend and Spring Boot backend, featuring user authentication with JWT tokens.

- [Process Log](https://docs.google.com/document/d/1DI4nT_FiSjuUoE3y4iuWL9wxJxcMkSOPzi-f7V6B5wM/edit?usp=sharing)

## Boilderplate

- There are some test code for login in frontend and backend, you can change if you want, this is just for testing.
- Also, for backend, it the file sturcture is too conplicated, you can also change.

## Tech Stack

- **Frontend**: React (Create React App)
- **Backend**: Spring Boot 3.2.0 (Java 21)
- **Database**: MySQL
- **Authentication**: Spring Security with JWT
- **Build Tools**: Maven (Backend), npm (Frontend)

## Prerequisites

Before running the project, ensure you have the following installed:

- **Java 21** - [Download](https://www.oracle.com/java/technologies/downloads/#java21)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 16+** and **npm** - [Download](https://nodejs.org/)
- **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/mysql/)

## Database Setup

1. Start your MySQL server.

2. Create a database (or let the application create it automatically):
   ```sql
   CREATE DATABASE csci201_db;
   ```

3. Update database credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

## Backend Setup and Run

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

   Alternatively, you can run the JAR file:
   ```bash
   java -jar target/project-1.0.0.jar
   ```

The backend server will start on `http://localhost:8080`

## Frontend Setup and Run

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Building for Production

### Backend

Build a JAR file:
```bash
cd backend
mvn clean package
```

The JAR file will be created at `backend/target/project-1.0.0.jar`

### Frontend

Build for production:
```bash
cd frontend
npm run build
```

The production build will be in the `frontend/build` directory.

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```

- `GET /api/auth/test` - Test authentication endpoint (public)

### Protected Endpoints

- `GET /api/test/protected` - Protected endpoint (requires authentication)
  - Headers: `Authorization: Bearer <token>`

## Project Structure

```
CSCI-201-Project/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/csci201/project/
│   │   │   │   ├── controller/     # REST controllers
│   │   │   │   ├── model/          # Entity classes
│   │   │   │   ├── repository/     # Data repositories
│   │   │   │   ├── security/       # Security configuration
│   │   │   │   ├── util/           # Utility classes (JWT)
│   │   │   │   └── dto/            # Data transfer objects
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.js
│   └── package.json
└── README.md
```

## Features

- User registration and login
- JWT-based authentication
- Protected routes in React
- Password encryption with BCrypt
- CORS configuration for frontend-backend communication
- RESTful API design

## Troubleshooting

### Backend Issues

- **Port 8080 already in use**: Change the port in `application.properties`:
  ```properties
  server.port=8081
  ```

- **Database connection error**: Verify MySQL is running and credentials are correct.

- **JWT secret warning**: Update the `jwt.secret` in `application.properties` with a strong random string for production.

### Frontend Issues

- **CORS errors**: Ensure the backend is running and CORS is properly configured.

- **API connection errors**: Verify the backend URL in `frontend/src/services/AuthService.js` matches your backend port.

## License

This project is for educational purposes.
