# Settings  for logging
from flask.logging import default_handler
import os
import logging
# format=’%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s’)

# absolute path to the root of the project directory
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), os.pardir))

DEBUG = True
TESTING = False

# Used for cookies later
SECRET_KEY = 'a-not-so-secret-key-000-!!!'

# Logging
LOGGING_FORMAT = '[%(asctime)s] %(remote_addr)s requested %(url)s\n' \
    '%(levelname)s in %(pathname)s:%(lineno)d - %(message)s'

if not os.path.join(PROJECT_ROOT, 'instance', 'app.log'):
    with open(os.path.join(PROJECT_ROOT, 'instance', 'app.log'), 'w+') as f:
        f.write('')
LOGGING_LOCATION = os.path.join(PROJECT_ROOT, 'instance', 'app.log')
LOGGING_LEVEL = logging.DEBUG

# Encoded files location
ENCODED_FILE_LOC = os.path.join(PROJECT_ROOT, 'app', 'static', 'react-app', 'public', 'frontend_textfiles')


