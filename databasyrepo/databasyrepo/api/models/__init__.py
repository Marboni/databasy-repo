from flask import Blueprint, render_template, flash, redirect, url_for, current_app
from flask.ext.login import login_required
from werkzeug.exceptions import NotFound
from databasyrepo.mg import mg
from databasyrepo.models import manager
from databasyrepo.models.core.errors import ModelNotFound

__author__ = 'Marboni'

bp = Blueprint('models', __name__)

@bp.route('/<int:model_id>/')
@login_required
def home(model_id):
    if not manager.model_exists(model_id, mg()):
        raise NotFound
    return render_template('model.html', model_id=model_id)


@bp.route('/<int:model_id>/delete/', methods=['GET'])
@login_required
def delete_model(model_id):
    try:
        model_info = current_app.pool.delete_model(model_id)
    except ModelNotFound:
        raise NotFound
    else:
        flash('Model "%s" removed.' % model_info['schema_name'], 'success')
        return redirect(url_for('root.home'))