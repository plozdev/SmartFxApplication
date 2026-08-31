#!/bin/bash
# Quick GCP Deployment Script for SmartFXApplication

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${1:-}"
REGION="${2:-us-central1}"
SERVICE_NAME="smartfx"
REGISTRY_REGION="us-central1"
REPO_NAME="smartfx-repo"

# Functions
print_step() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Check requirements
check_requirements() {
    print_step "Checking Requirements..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "docker not found. Install from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    echo -e "${GREEN}✓ gcloud CLI found${NC}"
    echo -e "${GREEN}✓ Docker found${NC}"
}

# Initialize GCP
init_gcp() {
    print_step "Initializing GCP..."
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "Project ID is required"
        echo "Usage: ./deploy.sh <PROJECT_ID> [REGION]"
        echo "Example: ./deploy.sh my-project-123 us-central1"
        exit 1
    fi
    
    echo "Setting project to: $PROJECT_ID"
    gcloud config set project "$PROJECT_ID"
    
    echo "Enabling required services..."
    gcloud services enable \
        cloudbuild.googleapis.com \
        run.googleapis.com \
        artifactregistry.googleapis.com \
        container.googleapis.com \
        --quiet
    
    echo -e "${GREEN}✓ GCP initialized${NC}"
}

# Create artifact registry repository
setup_artifact_registry() {
    print_step "Setting up Artifact Registry..."
    
    # Check if repo exists
    if gcloud artifacts repositories describe "$REPO_NAME" --location="$REGISTRY_REGION" 2>/dev/null; then
        echo "Repository already exists: $REPO_NAME"
    else
        echo "Creating repository: $REPO_NAME"
        gcloud artifacts repositories create "$REPO_NAME" \
            --repository-format=docker \
            --location="$REGISTRY_REGION" \
            --description="SmartFX Docker Repository" \
            --quiet
    fi
    
    echo "Configuring Docker authentication..."
    gcloud auth configure-docker "$REGISTRY_REGION-docker.pkg.dev" --quiet
    
    echo -e "${GREEN}✓ Artifact Registry configured${NC}"
}

# Build Docker image
build_docker_image() {
    print_step "Building Docker Image..."
    
    IMAGE_URL="$REGISTRY_REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"
    
    echo "Building: $IMAGE_URL"
    docker build -t "$IMAGE_URL" .
    
    echo -e "${GREEN}✓ Docker image built${NC}"
    echo "Image URL: $IMAGE_URL"
    export IMAGE_URL
}

# Push Docker image
push_docker_image() {
    print_step "Pushing Docker Image to Artifact Registry..."
    
    IMAGE_URL="$REGISTRY_REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"
    
    echo "Pushing: $IMAGE_URL"
    docker push "$IMAGE_URL"
    
    echo -e "${GREEN}✓ Docker image pushed${NC}"
    export IMAGE_URL
}

# Deploy to Cloud Run
deploy_cloud_run() {
    print_step "Deploying to Cloud Run..."
    
    IMAGE_URL="$REGISTRY_REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"
    
    echo "Service: $SERVICE_NAME"
    echo "Region: $REGION"
    echo "Image: $IMAGE_URL"
    
    gcloud run deploy "$SERVICE_NAME" \
        --image="$IMAGE_URL" \
        --platform managed \
        --region "$REGION" \
        --allow-unauthenticated \
        --memory 1Gi \
        --cpu 1 \
        --timeout 3600 \
        --max-instances 10 \
        --min-instances 1 \
        --quiet
    
    echo -e "${GREEN}✓ Deployed to Cloud Run${NC}"
}

# Set environment variables
set_environment_variables() {
    print_step "Setting Environment Variables..."
    
    read -p "Enter FASTFOREX_API_KEY (leave empty to skip): " api_key
    
    if [ -n "$api_key" ]; then
        echo "Updating environment variables..."
        gcloud run services update "$SERVICE_NAME" \
            --region "$REGION" \
            --update-env-vars="FASTFOREX_API_KEY=$api_key,SPRING_PROFILES_ACTIVE=prod" \
            --quiet
        echo -e "${GREEN}✓ Environment variables updated${NC}"
    else
        print_warning "API key not set. Update later with:"
        echo "gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars=FASTFOREX_API_KEY=xxx"
    fi
}

# Get service info
get_service_info() {
    print_step "Service Information"
    
    gcloud run services describe "$SERVICE_NAME" \
        --region "$REGION" \
        --format="value(status.url)"
    
    echo ""
    echo "Service details:"
    gcloud run services describe "$SERVICE_NAME" --region "$REGION"
}

# Main deployment flow
main() {
    echo -e "${YELLOW}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   SmartFX GCP Cloud Run Deployment        ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_requirements
    init_gcp
    setup_artifact_registry
    build_docker_image
    push_docker_image
    deploy_cloud_run
    set_environment_variables
    get_service_info
    
    echo ""
    print_step "Deployment Complete! 🚀"
    echo ""
    echo "Next steps:"
    echo "1. Visit the service URL above"
    echo "2. Check logs: gcloud run services logs read $SERVICE_NAME"
    echo "3. Update configs: gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars=KEY=VALUE"
}

# Run main function
main
