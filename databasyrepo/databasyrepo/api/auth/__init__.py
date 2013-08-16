from flask import Blueprint

__author__ = 'Marboni'

bp = Blueprint('auth', __name__)

@bp.route('/login/', methods=['GET', 'POST'])
def login():
    # Stub for url_for() calls. This URL will be handled on facade.
    pass
