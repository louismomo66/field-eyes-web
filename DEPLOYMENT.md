# FieldEyes Deployment Guide

This document outlines the steps for deploying the FieldEyes application to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Manual Deployment](#manual-deployment)
  - [Cloud Deployment](#cloud-deployment)
- [CI/CD Setup](#cicd-setup)
- [Security Considerations](#security-considerations)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Node.js v14 or later
- npm v6 or later
- Docker and Docker Compose (for containerized deployment)
- Access to a production server or cloud environment
- Domain name and SSL certificates (for production)

## Environment Variables

Before deploying, ensure all required environment variables are set. Refer to `.env.example` for a complete list.

### Critical Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API endpoint | https://api.fieldeyes.com/api |
| JWT_SECRET | Secret key for JWT authentication | your-jwt-secret-key |
| DB_DSN | Database connection string | user:password@tcp(host:3306)/dbname |

## Deployment Options

### Docker Deployment

The easiest way to deploy FieldEyes is using Docker Compose:

1. Clone the repository:
```bash
git clone https://github.com/your-org/fieldeyes.git
cd fieldeyes
```

2. Create a `.env` file based on the `.env.example`:
```bash
cp .env.example .env
# Edit .env with your production values
```

3. Build and start the containers:
```bash
docker-compose up -d
```

4. Verify the deployment:
```bash
docker-compose ps
```

### Manual Deployment

#### Frontend Deployment

1. Build the React application:
```bash
cd field-eyes-web
npm install
npm run build
```

2. Deploy the built files from the `build` directory to your web server (Nginx, Apache, etc.)

3. Configure your web server to serve the static files and handle client-side routing.

#### Backend Deployment

1. Build the Go backend:
```bash
cd field_eyes
go build -o server ./cmd/api
```

2. Set up environment variables on your server

3. Run the server:
```bash
./server
```

4. Configure a process manager (systemd, PM2, etc.) to keep the server running

### Cloud Deployment

#### AWS Deployment

1. Frontend:
   - Deploy the React build to an S3 bucket
   - Set up CloudFront distribution for CDN and HTTPS
   - Configure CloudFront to handle client-side routing

2. Backend:
   - Deploy to EC2, ECS, or EKS
   - Set up Application Load Balancer
   - Configure RDS for the database

#### Other Cloud Providers

Similar patterns apply to other cloud providers like GCP, Azure, or DigitalOcean.

## CI/CD Setup

This repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml` that:

1. Builds and tests the application
2. Deploys to AWS S3/CloudFront (configurable)
3. Sends notifications on deployment status

To use this workflow:

1. Set up the required GitHub repository secrets:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION
   - AWS_S3_BUCKET
   - AWS_CLOUDFRONT_DISTRIBUTION_ID
   - SLACK_WEBHOOK (optional, for notifications)

2. Push to the main branch to trigger deployments

## Security Considerations

1. Never commit sensitive environment variables to the repository
2. Ensure SSL/TLS is configured for all production environments
3. Regularly update dependencies to patch security vulnerabilities
4. Implement proper authentication and authorization checks
5. Use secure HTTP headers (already configured in the Nginx setup)

## Monitoring and Maintenance

1. Set up monitoring using tools like:
   - AWS CloudWatch
   - Prometheus and Grafana
   - Datadog or New Relic

2. Configure logging and log aggregation

3. Create regular database backups

4. Plan for zero-downtime deployments

5. Implement health checks and automated recovery procedures 