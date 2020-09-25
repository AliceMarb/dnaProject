from flask import Flask
# from werkzeug.contrib.fixers import ProxyFix
# from app.config import RequestFormatter
from app.errors import error_templates
from flask import has_request_context, request
from app.blueprints import dev_bp, master_bp, home_bp
import logging



def create_app(settings_override=None):
    # allows us to load files relative to the instance folder
    app = Flask(__name__, instance_relative_config=True)

    # no caching
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

    # default configuration
    app.config.from_object('config.settings')
    # overridden configuration values found in instance/settings.py
    # suppress errors if the file is missing
    app.config.from_pyfile('settings.py', silent=True)

    if settings_override:
        app.config.update(settings_override)

    logger(app)
    # middleware(app)
    # app.register_blueprint(home_bp)
    app.register_blueprint(dev_bp, url_prefix='/dev')
    app.register_blueprint(master_bp, url_prefix='/master')
    print(app.url_map)
    error_templates(app)

    return app

# https://flask.palletsprojects.com/en/1.1.x/logging/
# To include request information (IP address)
class RequestFormatter(logging.Formatter):
    def format(self, record):
        if has_request_context():
            record.url = request.url
            record.remote_addr = request.remote_addr
        else:
            record.url = None
            record.remote_addr = None

        return super().format(record)

# def middleware(app):
#     app.wsgi_app = ProxyFix(app.wsgi_app)

def logger(app):
    handler = logging.FileHandler(app.config['LOGGING_LOCATION'])
    handler.setLevel(app.config['LOGGING_LEVEL'])

    formatter = RequestFormatter(app.config['LOGGING_FORMAT'])
    handler.setFormatter(formatter)

    app.logger.addHandler(handler)



