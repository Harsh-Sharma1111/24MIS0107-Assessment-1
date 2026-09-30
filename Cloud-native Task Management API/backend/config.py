import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret-key')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'SQLALCHEMY_DATABASE_URI',
        'mysql+pymysql://root:password@localhost:3306/task_manager_dev'
    )

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'TEST_SQLALCHEMY_DATABASE_URI',
        'sqlite:///:memory:'
    )

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False
    
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '3306')
    DB_NAME = os.environ.get('DB_NAME', 'taskdb_prod')
    
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 280,
        'connect_args': {
            'ssl': {
                'require_secure_transport': True
            }
        }
    }

config_by_name = {
    'dev': DevelopmentConfig,
    'development': DevelopmentConfig,
    'test': TestingConfig,
    'prod': ProductionConfig
}
