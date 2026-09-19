from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app import db
from app.models import Sprint
from app.schemas import SprintSchema
from app.utils.auth import jwt_required

sprints_bp = Blueprint('sprints_bp', __name__, url_prefix='/api/sprints')
sprint_schema = SprintSchema()
sprints_schema = SprintSchema(many=True)

@sprints_bp.route('/', methods=['GET'])
def get_sprints():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status_filter = request.args.get('status')
    
    query = Sprint.query
    
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "items": sprints_schema.dump(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": pagination.per_page
    }), 200

@sprints_bp.route('/<int:id>', methods=['GET'])
def get_sprint(id):
    sprint = Sprint.query.get_or_404(id)
    return jsonify(sprint_schema.dump(sprint)), 200

@sprints_bp.route('/', methods=['POST'])
@jwt_required
def create_sprint():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
        
    try:
        sprint = sprint_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 400
        
    db.session.add(sprint)
    db.session.commit()
    
    return jsonify(sprint_schema.dump(sprint)), 201

@sprints_bp.route('/<int:id>', methods=['PUT'])
@jwt_required
def update_sprint(id):
    sprint = Sprint.query.get_or_404(id)
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
        
    try:
        sprint = sprint_schema.load(json_data, instance=sprint, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400
        
    db.session.commit()
    
    return jsonify(sprint_schema.dump(sprint)), 200

@sprints_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required
def delete_sprint(id):
    sprint = Sprint.query.get_or_404(id)
    db.session.delete(sprint)
    db.session.commit()
    return '', 204
