from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import Task
from app.schemas import TaskSchema
from app.utils.auth import jwt_required

tasks_bp = Blueprint('tasks_bp', __name__, url_prefix='/api/tasks')
task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)

@tasks_bp.route('/', methods=['GET'])
def get_tasks():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    status_filter = request.args.get('status')
    sprint_id_filter = request.args.get('sprint_id')
    assignee_id_filter = request.args.get('assignee_id')
    
    query = Task.query
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    if sprint_id_filter:
        query = query.filter_by(sprint_id=sprint_id_filter)
    if assignee_id_filter:
        query = query.filter_by(assignee_id=assignee_id_filter)
        
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "items": tasks_schema.dump(pagination.items),
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": pagination.per_page
    }), 200

@tasks_bp.route('/<int:id>', methods=['GET'])
def get_task(id):
    task = Task.query.get_or_404(id)
    return jsonify(task_schema.dump(task)), 200

@tasks_bp.route('/', methods=['POST'])
@jwt_required
def create_task():
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
        
    try:
        task = task_schema.load(json_data)
    except ValidationError as err:
        return jsonify(err.messages), 400
        
    try:
        db.session.add(task)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Invalid sprint_id or assignee_id provided. The referenced record does not exist."}), 400
    
    return jsonify(task_schema.dump(task)), 201

@tasks_bp.route('/<int:id>', methods=['PUT'])
@jwt_required
def update_task(id):
    task = Task.query.get_or_404(id)
    json_data = request.get_json()
    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
        
    try:
        task = task_schema.load(json_data, instance=task, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400
        
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Invalid sprint_id or assignee_id provided. The referenced record does not exist."}), 400
    
    return jsonify(task_schema.dump(task)), 200

@tasks_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return '', 204
