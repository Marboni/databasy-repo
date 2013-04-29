from flask import Blueprint, render_template

__author__ = 'Marboni'

bp = Blueprint('models', __name__)

@bp.route('/<int:model_id>/')
def home(model_id):
    return render_template('model.html', model_id=model_id)
