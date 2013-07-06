from flask import Blueprint, render_template
from werkzeug.exceptions import NotFound
from databasyrepo.mg import mg
from databasyrepo.models import manager

__author__ = 'Marboni'

bp = Blueprint('models', __name__)

@bp.route('/<int:model_id>/')
def home(model_id):
    if not manager.model_exists(model_id, mg()):
        raise NotFound
    return render_template('model.html', model_id=model_id)
