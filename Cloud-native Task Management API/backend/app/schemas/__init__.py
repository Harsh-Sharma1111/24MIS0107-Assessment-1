from marshmallow import fields, validate
from app import ma
from app.models import User, Sprint, Task

class MinimalUserSchema(ma.SQLAlchemyAutoSchema):
    """Schema for a minimal user representation."""
    class Meta:
        model = User
        fields = ('id', 'name')

class MinimalSprintSchema(ma.SQLAlchemyAutoSchema):
    """Schema for a minimal sprint representation."""
    class Meta:
        model = Sprint
        fields = ('id', 'name')

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ('password_hash',)

class SprintSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Sprint
        load_instance = True

class TaskSchema(ma.SQLAlchemyAutoSchema):
    # Validation fields
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    status = fields.String(validate=validate.OneOf(['todo', 'in_progress', 'done']))
    priority = fields.String(validate=validate.OneOf(['low', 'medium', 'high']))

    # Optional nested minimal schemas
    assignee = fields.Nested(MinimalUserSchema, dump_only=True)
    sprint = fields.Nested(MinimalSprintSchema, dump_only=True)

    class Meta:
        model = Task
        load_instance = True
        include_fk = True

