# Spring Boot React - Gestion Port

This repository contains a web application for managing port operations, built using Spring Boot for the back-end and React for the front-end.

## Features

- **Spring Boot**: RESTful API back-end implementation.
- **React**: Modern UI for user interaction.
- **Database Integration**: Persist data using a relational database.
- **Authentication**: User authentication and role-based authorization.
- **CRUD Operations**: Manage port-related data (e.g., ships, schedules, cargo).

## Getting Started

### Prerequisites

- **Java 17+( recommended JDK 24 )**
- **Node.js 18+** and **npm**
- **Maven/Gradle** (for building the Spring Boot application)
- A relational database (e.g., MySQL, PostgreSQL)
- An IDE for Java (e.g., IntelliJ IDEA) and a code editor for React (e.g., VSCode)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Elkas-Hamza/spring_boot-react-ges_port.git
   cd spring_boot-react-ges_port
   ```

#### Back-End (Spring Boot)

2. Navigate to the `backend` directory:
   ```bash
   cd stage_back
   ```

3. Configure your database in `application.properties` or `application.yml`.

4. Build and run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

#### Front-End (React)

5. Navigate to the `frontend` directory:
   ```bash
   cd ..front
   ```

6. Install dependencies:
   ```bash
   npm install
   ```

7. Start the React development server:
   ```bash
   npm start
   ```

### Access the Application

- Front-end: `http://localhost:3000`
- Back-end API: `http://localhost:8080`

## Project Structure

```plaintext
spring_boot-react-ges_port/
├── stage_back/        # Spring Boot back-end
├── front/             # React front-end
└── README.md          # Project documentation
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### Steps to Contribute

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch.
4. Open a pull request with a detailed description.

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

## Contact

For any questions or feedback, feel free to reach out:

- **Author**: Hamza Elkasmi
- **Email**: [elkasmihamza05@gmail.com.com]
- **GitHub**: [Elkas-Hamza](https://github.com/Elkas-Hamza)
