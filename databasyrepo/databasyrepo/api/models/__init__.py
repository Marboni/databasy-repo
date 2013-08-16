from flask import Blueprint, render_template
from flask.ext.login import login_required
from werkzeug.exceptions import NotFound
from databasyrepo.mg import mg
from databasyrepo.models import manager

__author__ = 'Marboni'

bp = Blueprint('models', __name__)

@bp.route('/<int:model_id>/')
@login_required
def home(model_id):
    if not manager.model_exists(model_id, mg()):
        raise NotFound
    return render_template('model.html', model_id=model_id)
