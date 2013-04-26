from flask import Blueprint, render_template

__author__ = 'Marboni'

bp = Blueprint('general', __name__)

@bp.route('/')
def home():
    return render_template('index.html')
