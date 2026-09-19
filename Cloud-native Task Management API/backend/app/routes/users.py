from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from marshmallow import ValidationError
from app import db
from app.models import User
from app.schemas import UserSchema
from app.utils.auth import jwt_required

users_bp = Blueprint('users_bp', __name__, url_prefix='/api/users')
user_schema = UserSchema()
users_schema = UserSchema(many=True)

@users_bp.route('/', methods=['GET'])
def get_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = User.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "items": users_schema.dump(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": pagination.per_page
    }), 200

@users_bp.route('/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify(user_schema.dump(user)), 200

@users_bp.route('/', methods=['POST'])
@jwt_required
def create_user():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
        
    data_to_load = json_data.copy()
    password = data_to_load.pop('password', None)
    
    if not password:
        return jsonify({"password": ["Missing data for required field."]}), 400
        
    try:
        user = user_schema.load(data_to_load)
    except ValidationError as err:
        return jsonify(err.messages), 400
        
    if User.query.filter_by(email=user.email).first():
        return jsonify({"email": ["Email already registered."]}), 400
        
    user.password_hash = generate_password_hash(password)
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify(user_schema.dump(user)), 201

@users_bp.route('/<int:id>', methods=['PUT'])
@jwt_required
def update_user(id):
    user = User.query.get_or_404(id)
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
        
    data_to_load = json_data.copy()
    password = data_to_load.pop('password', None)
        
    try:
        user = user_schema.load(data_to_load, instance=user, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400
        
    if password:
        user.password_hash = generate_password_hash(password)
        
    db.session.commit()
    
    return jsonify(user_schema.dump(user)), 200

@users_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return '', 204
