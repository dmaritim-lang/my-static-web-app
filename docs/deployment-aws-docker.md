# Lipa Fare: simple Docker + AWS deployment steps

These steps keep everything beginner-friendly. You will containerize the backend and Next.js dashboard, push images to Amazon ECR, and run them on AWS Fargate behind an Application Load Balancer (ALB). Adjust values (regions, VPC IDs, domain names) to your setup.

## 1) Prerequisites
- AWS account with IAM user/role that can create ECR, ECS, RDS, ElastiCache, ACM certificates, ALBs, and Route 53 records.
- AWS CLI v2 installed and configured (`aws configure`).
- Docker installed locally.
- (Optional) A domain managed in Route 53 for HTTPS endpoints.

## 2) Build Docker images locally
From the repo root:
```bash
# Backend (NestJS) builds to port 3000
docker build -f backend/Dockerfile -t lipa-fare-backend:latest backend

# Dashboard (Next.js) builds to port 3001
docker build -f next-dashboard/Dockerfile -t lipa-fare-dashboard:latest next-dashboard
```

## 3) Create ECR repos and push images
```bash
AWS_REGION="us-east-1"                               # change region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BACKEND_REPO="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/lipa-fare-backend"
DASH_REPO="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/lipa-fare-dashboard"

aws ecr create-repository --repository-name lipa-fare-backend || true
aws ecr create-repository --repository-name lipa-fare-dashboard || true

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

docker tag lipa-fare-backend:latest $BACKEND_REPO:latest
docker tag lipa-fare-dashboard:latest $DASH_REPO:latest

docker push $BACKEND_REPO:latest
docker push $DASH_REPO:latest
```

## 4) Provision core AWS services
- **VPC**: Use an existing VPC with public subnets (for ALB) and private subnets (for ECS tasks, RDS, Redis). Ensure required security groups.
- **PostgreSQL (RDS)**: Small instance (e.g., db.t3.micro) with automatic backups. Note host, port, db name, username, password.
- **Redis (ElastiCache)**: Small cluster or single node (cache.t3.micro) for sessions/USSD.
- **S3 bucket**: For static exports/reports (optional for MVP). Enable bucket encryption and block public access; front via CloudFront later if serving files.
- **Secrets/parameters**: Store credentials in AWS Systems Manager Parameter Store or Secrets Manager:
  - `/lipa-fare/DB_URL`
  - `/lipa-fare/REDIS_URL`
  - `/lipa-fare/MPESA_CONSUMER_KEY`
  - `/lipa-fare/MPESA_CONSUMER_SECRET`
  - `/lipa-fare/MPESA_SHORTCODE`
  - `/lipa-fare/MPESA_PASSKEY`
  - `/lipa-fare/MPESA_BASEURL` (sandbox or production)
  - `/lipa-fare/API_PORT` (default 3000)

## 5) Create ECS Fargate cluster and task definitions
Create one ECS cluster (Fargate) with two services: backend and dashboard.

### Backend task definition (port 3000)
- Image: `$BACKEND_REPO:latest`
- CPU/Memory: start with 0.25 vCPU / 512MB
- Env vars (from SSM/Secrets): `DB_URL`, `REDIS_URL`, `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY`, `MPESA_BASEURL`, `PORT=3000`
- Port mapping: 3000 TCP
- Logging: awslogs driver to CloudWatch `/aws/ecs/lipa-fare-backend`

### Dashboard task definition (port 3001)
- Image: `$DASH_REPO:latest`
- CPU/Memory: start with 0.25 vCPU / 512MB
- Env vars: `BACKEND_URL` (ALB URL for API), `PORT=3001`
- Port mapping: 3001 TCP
- Logging: awslogs to `/aws/ecs/lipa-fare-dashboard`

## 6) Application Load Balancer (ALB)
- Create one ALB with two target groups:
  - **api-tg** → port 3000 (backend service)
  - **web-tg** → port 3001 (dashboard service)
- Listeners:
  - :80 → redirect to :443
  - :443 → host/path rules
    - `api.yourdomain.com/*` → api-tg
    - `dashboard.yourdomain.com/*` → web-tg
- Attach security groups to allow 80/443 inbound and the appropriate outbound to tasks.

## 7) HTTPS certificates
- Use AWS Certificate Manager (ACM) in the same region as the ALB.
- Request certs for `api.yourdomain.com` and `dashboard.yourdomain.com` (or `*.yourdomain.com`).
- Attach the certs to the ALB’s HTTPS listener.

## 8) Route 53 DNS
- Create A/AAAA records pointing `api.yourdomain.com` and `dashboard.yourdomain.com` to the ALB (alias records recommended).

## 9) Wire external callbacks
- **M-Pesa C2B**: In Daraja portal, set the confirmation and validation URLs to `https://api.yourdomain.com/payments/c2b/confirmation` and `https://api.yourdomain.com/payments/c2b/validation`.
- **USSD gateway**: Point the gateway to `https://api.yourdomain.com/ussd`.

## 10) Deploy & verify
1. Update ECS service to use the pushed `latest` images (or new tags per release).
2. Wait for tasks to become healthy in target groups.
3. Smoke test:
   - `curl https://api.yourdomain.com/health` (add a health endpoint if needed).
   - Load `https://dashboard.yourdomain.com`.
4. Check CloudWatch Logs for startup output and errors.

## 11) Ongoing operations
- Use new image tags per release (`v0.1.0`, etc.) and update ECS services.
- Enable autoscaling on ECS services and set RDS backups + minor version upgrades.
- Add CloudWatch alarms on 5xx error rates, CPU/memory, and RDS/Redis health.
- Periodically rotate secrets in Parameter Store/Secrets Manager.

## Appendix: local overrides
- You can override env vars per environment by changing the ECS task definition or parameter store values.
- For a quick local test without AWS services, run containers with simple envs:
```bash
docker run -p 3000:3000 lipa-fare-backend:latest
# In another terminal
docker run -p 3001:3001 -e BACKEND_URL="http://localhost:3000" lipa-fare-dashboard:latest
```
