<!-- afa48530-8351-44f3-a954-7a32d126c4fb e0ebaf49-4127-4932-87e2-41c0969d8f76 -->
# Starter Code Plan: Spring Boot + React + MySQL

This plan will generate a starter project with a Spring Boot backend and a React frontend.

## Project Root Setup

1.  **Git Configuration**: Create a `.gitignore` file at the root to exclude:

    -   `node_modules/`, `build/`, `dist/` (Frontend)
    -   `target/`, `.mvn/`, `*.class`, `.idea/`, `*.iml` (Backend)
    -   System files (`.DS_Store`)

## Project Root Setup

1.  **Git Configuration**: Create a `.gitignore` file at the root to exclude:

    -   `node_modules/`, `build/`, `dist/` (Frontend)
    -   `target/`, `.mvn/`, `*.class`, `.idea/`, `*.iml` (Backend)
    -   System files (`.DS_Store`)

## Backend Setup (Spring Boot + Maven)

1.  **Create Project Structure**: Set up `backend/` directory with standard Maven structure.
2.  **Dependencies (`pom.xml`)**: Add Spring Boot 3.x, Spring Security, Spring Data JPA, MySQL Driver, and JJWT (for token-based auth).
3.  **Configuration (`application.properties`)**: Configure MySQL database connection and server port (8080).
4.  **Security Implementation**:

    -   `User` Entity & Repository.
    -   `SecurityConfig`: Configure filter chain to allow login endpoints and protect others.
    -   `JwtUtils`: Utility for generating and validating JWT tokens.
    -   `AuthController`: Endpoints for login and registration.

## Frontend Setup (React - Create React App)

1.  **Initialize App**: Run `npx create-react-app frontend` to scaffold the UI.
2.  **Dependencies**: Install `axios` for API requests and `react-router-dom` for navigation.
3.  **Authentication Components**:

    -   `AuthService`: Helper for storing JWT in localStorage and making API calls.
    -   `Login`: Login form component.
    -   `App.js`: Setup routing with a protected route example.

## Database

1.  **Schema**: The application will automatically generate tables (`update` ddl-auto) or we can provide a `schema.sql`.

## Documentation

1.  **Update README.md**: Add instructions for:

    -   Prerequisites (Java 21, Maven, Node.js, MySQL).
    -   Setting up the database.
    -   Building and running the backend.
    -   Installing dependencies and running the frontend.

## Next Steps

I will verify the directory structure and begin generating the backend files first, followed by the frontend generation.

### To-dos

- [x] 