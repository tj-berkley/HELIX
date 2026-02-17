#!/bin/bash

# GoogleHubs Production Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 GoogleHubs Production Deployment"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "Prerequisites check passed"
echo ""

# Ask deployment platform
echo "Select deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Netlify"
echo "3) Build only (manual deployment)"
echo ""
read -p "Enter choice (1-3): " platform

case $platform in
    1)
        DEPLOY_PLATFORM="vercel"
        ;;
    2)
        DEPLOY_PLATFORM="netlify"
        ;;
    3)
        DEPLOY_PLATFORM="manual"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Check environment variables
echo ""
echo "Checking environment variables..."

if [ ! -f .env ]; then
    print_error ".env file not found!"
    echo "Create .env file with required variables. See .env.example"
    exit 1
fi

# Count VITE_ variables
VITE_COUNT=$(grep -c "^VITE_" .env || true)
if [ "$VITE_COUNT" -lt 7 ]; then
    print_warning "Only $VITE_COUNT VITE_ variables found. You may be missing some."
    read -p "Continue anyway? (y/n): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
fi

print_success "Environment variables found"
echo ""

# Build the project
echo "Building project..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed!"
    exit 1
fi

print_success "Build completed successfully"
echo ""

# Deploy based on platform
case $DEPLOY_PLATFORM in
    vercel)
        echo "Deploying to Vercel..."

        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi

        echo ""
        echo "Starting Vercel deployment..."
        vercel --prod

        print_success "Deployed to Vercel!"
        ;;

    netlify)
        echo "Deploying to Netlify..."

        if ! command -v netlify &> /dev/null; then
            print_warning "Netlify CLI not found. Installing..."
            npm install -g netlify-cli
        fi

        echo ""
        echo "Starting Netlify deployment..."
        netlify deploy --prod --dir=dist

        print_success "Deployed to Netlify!"
        ;;

    manual)
        print_success "Build complete! Your files are in the 'dist' folder."
        echo ""
        echo "Next steps:"
        echo "1. Upload the 'dist' folder to your web server"
        echo "2. Configure your web server to serve index.html for all routes"
        echo "3. Ensure HTTPS is enabled"
        echo "4. Set environment variables on your server"
        ;;
esac

echo ""
echo "===================================="
echo "🎉 Deployment Complete!"
echo ""
echo "Important Post-Deployment Steps:"
echo ""
echo "1. Deploy Supabase Edge Functions:"
echo "   supabase functions deploy stripe-checkout"
echo "   supabase functions deploy stripe-webhooks"
echo "   supabase functions deploy prospects-api"
echo ""
echo "2. Set Supabase Secrets:"
echo "   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY"
echo "   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET"
echo ""
echo "3. Configure Stripe Webhooks:"
echo "   - URL: https://tocklatovmhdempnvzpq.supabase.co/functions/v1/stripe-webhooks"
echo "   - Events: checkout.session.completed, customer.subscription.*, invoice.*"
echo ""
echo "4. Test your deployment:"
echo "   - Visit your live URL"
echo "   - Test sign-up flow"
echo "   - Test payment with real card"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."
echo ""
