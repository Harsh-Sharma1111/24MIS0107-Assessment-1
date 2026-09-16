#!/bin/bash

# Create directories
mkdir -p backend/app/routes
mkdir -p backend/app/schemas
mkdir -p frontend
mkdir -p tests
mkdir -p .github/workflows

# Create Python files with one-line docstring placeholders
echo '"""Main application initialization."""' > backend/app/__init__.py
echo '"""Database models for the application."""' > backend/app/models.py
echo '"""Route handlers initialization."""' > backend/app/routes/__init__.py
echo '"""Marshmallow schemas initialization."""' > backend/app/schemas/__init__.py
echo '"""Application configuration variables."""' > backend/config.py
echo '"""Entry point for running the Flask application."""' > backend/run.py

echo '"""Test suite initialization."""' > tests/__init__.py
echo '"""Pytest configuration and shared fixtures."""' > tests/conftest.py

# Create empty files
touch backend/requirements.txt
touch .gitignore
touch README.md

# Add .gitkeep to empty folders
touch .github/workflows/.gitkeep
touch frontend/.gitkeep

echo "Project skeleton created successfully."
