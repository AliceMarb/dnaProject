import os 
import logging
from main import app

def init_log(log_name):
    from logging.handlers import RotatingFileHandler

    # logging globals
    