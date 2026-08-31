@echo off
REM Quick GCP Deployment Script for SmartFXApplication (Windows)
REM Usage: deploy.bat <PROJECT_ID> [REGION]

setlocal enabledelayedexpansion

set PROJECT_ID=%1
set REGION=%2
if "%REGION%"=="" set REGION=us-central1

set SERVICE_NAME=smartfx
set REGISTRY_REGION=us-central1
set REPO_NAME=smartfx-repo

if "%PROJECT_ID%"=="" (
    echo [ERROR] Project ID is required
    echo Usage: deploy.bat ^<PROJECT_ID^> [REGION]
    echo Example: deploy.bat my-project-123 us-central1
    exit /b 1
)

echo.
echo ========================================
echo   SmartFX GCP Cloud Run Deployment
echo ========================================
echo.

echo [STEP 1] Checking requirements...
where gcloud >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] gcloud CLI not found
    exit /b 1
)
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found
    exit /b 1
)
echo [OK] Prerequisites checked

echo.
echo [STEP 2] Setting GCP project...
gcloud config set project %PROJECT_ID%

echo.
echo [STEP 3] Enabling GCP services...
gcloud services enable ^
    cloudbuild.googleapis.com ^
    run.googleapis.com ^
    artifactregistry.googleapis.com ^
    container.googleapis.com

echo.
echo [STEP 4] Setting up Artifact Registry...
gcloud artifacts repositories describe %REPO_NAME% --location=%REGISTRY_REGION% >nul 2>&1
if %errorlevel% neq 0 (
    echo Creating repository: %REPO_NAME%
    gcloud artifacts repositories create %REPO_NAME% ^
        --repository-format=docker ^
        --location=%REGISTRY_REGION% ^
        --description="SmartFX Docker Repository"
) else (
    echo Repository already exists: %REPO_NAME%
)

echo Configuring Docker authentication...
call gcloud auth configure-docker %REGISTRY_REGION%-docker.pkg.dev --quiet

echo.
echo [STEP 5] Building Docker image...
set IMAGE_URL=%REGISTRY_REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/%SERVICE_NAME%:latest
echo Building: !IMAGE_URL!
docker build -t !IMAGE_URL! .

echo.
echo [STEP 6] Pushing Docker image to Artifact Registry...
echo Pushing: !IMAGE_URL!
docker push !IMAGE_URL!

echo.
echo [STEP 7] Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
    --image=!IMAGE_URL! ^
    --platform managed ^
    --region %REGION% ^
    --allow-unauthenticated ^
    --memory 1Gi ^
    --cpu 1 ^
    --timeout 3600 ^
    --max-instances 10 ^
    --min-instances 1 ^
    --quiet

echo.
echo [STEP 8] Service information...
gcloud run services describe %SERVICE_NAME% --region %REGION% --format="value(status.url)"

echo.
echo ========================================
echo Deployment Complete! [OK]
echo ========================================
echo.
echo Next steps:
echo 1. Visit the service URL above
echo 2. Check logs: gcloud run services logs read %SERVICE_NAME%
echo 3. Set env vars: gcloud run services update %SERVICE_NAME% --region %REGION% --update-env-vars=FASTFOREX_API_KEY=your-key
echo.

endlocal
