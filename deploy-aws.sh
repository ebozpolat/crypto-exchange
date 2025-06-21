# Deploy Xosmox to AWS using ECS Fargate

# 1. Create ECS Cluster
aws ecs create-cluster --cluster-name xosmox-cluster

# 2. Create ECR repositories
aws ecr create-repository --repository-name xosmox/backend
aws ecr create-repository --repository-name xosmox/frontend

# 3. Build and push Docker images
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd xosmox-backend
docker build -t xosmox/backend .
docker tag xosmox/backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/xosmox/backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/xosmox/backend:latest

# Build and push frontend
cd ../frontend
docker build -t xosmox/frontend .
docker tag xosmox/frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/xosmox/frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/xosmox/frontend:latest

# 4. Create RDS PostgreSQL instance
aws rds create-db-instance \
    --db-instance-identifier xosmox-postgres \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username xosmox \
    --master-user-password YourSecurePassword \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx

# 5. Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id xosmox-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1

# 6. Create ECS Task Definitions and Services
# Use the provided task-definition.json files

# 7. Create Application Load Balancer
aws elbv2 create-load-balancer \
    --name xosmox-alb \
    --subnets subnet-xxxxxxxx subnet-yyyyyyyy \
    --security-groups sg-xxxxxxxxx