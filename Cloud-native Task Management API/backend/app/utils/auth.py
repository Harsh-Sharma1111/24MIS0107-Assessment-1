from functools import wraps
import jwt
from flask import request, jsonify, current_app, g

def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Authorization header is missing"}), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({"error": "Invalid Authorization header format. Expected 'Bearer <token>'"}), 401
            
        token = parts[1]
        
        try:
            decoded_token = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'], 
                algorithms=["HS256"]
            )
            g.user_id = decoded_token['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
            
        return f(*args, **kwargs)
        
    return decorated_function
