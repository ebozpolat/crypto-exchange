#!/bin/bash

# Xosmox GitHub Upload Script
echo "🚀 Xosmox GitHub Upload Helper"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_info "Initializing Git repository..."
    git init
    print_status "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Add all files to git
print_info "Adding files to Git..."
git add .

# Check git status
echo ""
print_info "Git Status:"
git status --short

# Commit changes
echo ""
read -p "Enter commit message (default: 'Initial commit - Xosmox crypto exchange platform'): " commit_message
commit_message=${commit_message:-"Initial commit - Xosmox crypto exchange platform"}

git commit -m "$commit_message"
print_status "Changes committed"

# Check if remote origin exists
if git remote get-url origin &> /dev/null; then
    print_status "Remote origin already configured"
    git remote -v
else
    echo ""
    print_warning "No remote repository configured"
    echo ""
    echo "Please follow these steps to upload to GitHub:"
    echo ""
    echo "1. Go to https://github.com and create a new repository named 'xosmox'"
    echo "2. Copy the repository URL (e.g., https://github.com/yourusername/xosmox.git)"
    echo "3. Run this command to add the remote:"
    echo "   git remote add origin https://github.com/yourusername/xosmox.git"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url
    
    if [ ! -z "$repo_url" ]; then
        git remote add origin "$repo_url"
        print_status "Remote origin added: $repo_url"
    else
        print_warning "No repository URL provided. You'll need to add it manually."
        echo ""
        echo "Manual commands to run after creating GitHub repository:"
        echo "git remote add origin https://github.com/yourusername/xosmox.git"
        echo "git branch -M main"
        echo "git push -u origin main"
        exit 0
    fi
fi

# Set main branch
print_info "Setting main branch..."
git branch -M main

# Push to GitHub
echo ""
print_info "Pushing to GitHub..."
if git push -u origin main; then
    print_status "Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your Xosmox project is now on GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Set up branch protection rules"
    echo "3. Configure GitHub Actions secrets if needed"
    echo "4. Add collaborators if working in a team"
    echo "5. Create issues and project boards"
    echo ""
    echo "Repository features enabled:"
    echo "✅ Comprehensive README with setup instructions"
    echo "✅ Docker and Kubernetes deployment configs"
    echo "✅ GitHub Actions CI/CD pipeline"
    echo "✅ Security scanning workflow"
    echo "✅ Contributing guidelines"
    echo "✅ MIT License"
    echo "✅ Proper .gitignore"
    echo ""
else
    print_error "Failed to push to GitHub"
    echo ""
    echo "Common issues and solutions:"
    echo "1. Authentication: Make sure you're logged in to GitHub CLI or have SSH keys set up"
    echo "2. Repository doesn't exist: Create the repository on GitHub first"
    echo "3. Permission denied: Check if you have write access to the repository"
    echo ""
    echo "Manual upload steps:"
    echo "1. Create repository on GitHub: https://github.com/new"
    echo "2. Copy the repository URL"
    echo "3. Run: git remote set-url origin YOUR_REPO_URL"
    echo "4. Run: git push -u origin main"
fi

echo ""
print_info "Repository structure uploaded:"
echo "📁 Root directory with deployment scripts"
echo "📁 frontend/ - React TypeScript application"
echo "📁 xosmox-backend/ - Node.js backend API"
echo "📁 k8s/ - Kubernetes deployment manifests"
echo "📁 .github/ - GitHub Actions workflows"
echo "📄 Comprehensive documentation and guides"