from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_cors import CORS

# Initialize extensions globally
db = SQLAlchemy()
ma = Marshmallow()

def create_app(config_class):
    """Application factory for Flask."""
    app = Flask(__name__)
    
    # If a string like 'development' is passed, resolve it to the config class
    if isinstance(config_class, str):
        from backend.config import config_by_name
        config_class = config_by_name.get(config_class, config_by_name['dev'])
        
    app.config.from_object(config_class)

    # Initialize extensions with the app
    db.init_app(app)
    ma.init_app(app)
    
    # Configure CORS to allow all origins on /api/* for now
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from .routes.users import users_bp
    from .routes.sprints import sprints_bp
    from .routes.tasks import tasks_bp
    from .routes.auth import auth_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(sprints_bp, url_prefix='/api/sprints')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')

    # Centralized error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request"}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not Found"}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"error": "Internal Server Error"}), 500

    return app
