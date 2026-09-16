from app import create_app
from config import DevelopmentConfig

# Create the application instance using the DevelopmentConfig
app = create_app(DevelopmentConfig)

if __name__ == '__main__':
    # Run the application
    app.run(host='0.0.0.0', port=5000, debug=True)
