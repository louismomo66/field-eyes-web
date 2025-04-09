# FieldEyes Application

FieldEyes is a precision agriculture monitoring platform that allows farmers to track sensors deployed in their fields, analyze data, and make informed decisions.

## Features

- User authentication (login, signup, forgot password, reset password)
- Dashboard with device status and metrics
- Map view for deployed sensors
- Analytics for sensor data visualization
- User profile and settings management

## Tech Stack

- Frontend: React, TypeScript, Bootstrap
- Backend: Go (Golang)
- Database: SQL (via GORM)
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Go (v1.16 or later)
- SQL database (MySQL, PostgreSQL)

### Environment Setup

#### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/fieldeyes.git
cd fieldeyes/field-eyes-web
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `field-eyes-web` directory with the following variables:
```
REACT_APP_API_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm start
```

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd field_eyes
```

2. Install Go dependencies:
```bash
go mod download
```

3. Set up environment variables in a `.env` file:
```
DB_DSN=user:password@tcp(localhost:3306)/fieldeyes_db
JWT_SECRET=your-jwt-secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_FROM=no-reply@fieldeyes.com
```

4. Run the backend server:
```bash
go run ./cmd/api
```

## Production Deployment

### Frontend Deployment

1. Build the frontend for production:
```bash
cd field-eyes-web
npm run build
```

2. The optimized production files will be in the `build` directory. These can be deployed to any static hosting service like:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

3. Using a static file server:
```bash
npm install -g serve
serve -s build
```

### Backend Deployment

1. Build the backend for your target platform:
```bash
cd field_eyes
go build -o fieldeyes-server ./cmd/api
```

2. Deploy to your server (examples):

   #### Using Systemd (Linux)
   Create a service file at `/etc/systemd/system/fieldeyes.service`:
   ```
   [Unit]
   Description=FieldEyes API Server
   After=network.target

   [Service]
   User=<user>
   WorkingDirectory=/path/to/fieldeyes
   ExecStart=/path/to/fieldeyes/fieldeyes-server
   Restart=on-failure
   Environment=DB_DSN=user:password@tcp(localhost:3306)/fieldeyes_db
   Environment=JWT_SECRET=your-jwt-secret
   # Add other environment variables here

   [Install]
   WantedBy=multi-user.target
   ```

   Then enable and start the service:
   ```bash
   sudo systemctl enable fieldeyes
   sudo systemctl start fieldeyes
   ```

   #### Using Docker
   Create a Dockerfile in the root directory and build:
   ```bash
   docker build -t fieldeyes-api .
   docker run -p 8080:8080 \
     -e DB_DSN=user:password@tcp(localhost:3306)/fieldeyes_db \
     -e JWT_SECRET=your-jwt-secret \
     # Other environment variables
     fieldeyes-api
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/signup`: Create a new user account
- `POST /api/login`: Authenticate a user
- `POST /api/forgot-password`: Request password reset
- `POST /api/reset-password`: Reset password with OTP

### Device Endpoints

- `GET /api/devices`: List all devices for the authenticated user
- `GET /api/devices/:id`: Get details of a specific device
- `POST /api/devices`: Register a new device
- `PUT /api/devices/:id`: Update device information

### Data Endpoints

- `GET /api/data/:device_id`: Get data for a specific device
- `GET /api/analytics/:device_id`: Get analytics for a specific device

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Lead - your-email@example.com

Project Link: [https://github.com/your-org/fieldeyes](https://github.com/your-org/fieldeyes)
