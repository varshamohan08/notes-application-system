import logging
from django.conf import settings
from datetime import datetime
from os import path

class ErrorLogger(object):
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.ERROR)

        # Define the log file path
        log_file_path = path.join(settings.BASE_DIR, 'log', 'error.log')

        # os.makedirs(os.path.dirname(log_file_path), exist_ok=True)

        # Ensure the log file exists
        if not path.exists(log_file_path):
            with open(log_file_path, 'w'):
                pass

        logger_handler = logging.FileHandler(log_file_path)
        logger_handler.setLevel(logging.ERROR)

        logger_formatter = logging.Formatter('%(asctime)s - %(pathname)s - %(lineno)d - %(module)s - %(funcName)s - %(levelname)s - %(message)s - %(details)s')

        logger_handler.setFormatter(logger_formatter)

        self.logger.addHandler(logger_handler)