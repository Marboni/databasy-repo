from flask import Blueprint

__author__ = 'Marboni'

bp = Blueprint('root', __name__)

@bp.route('/', methods=['GET', 'POST'])
def home():
    # Stub for url_for() calls. This URL will be handled on facade.
    pass