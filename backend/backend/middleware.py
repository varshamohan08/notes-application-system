from django.http import JsonResponse
from sys import exc_info
from utils import ins_logger

class CustomExceptionHandlerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = None
        # import pdb;pdb.set_trace()
        try:
            response = self.get_response(request)
            if response.status_code >= 400:
                exc_type, exc_value, exc_traceback = exc_info()
                if exc_traceback:
                    ins_logger.logger.error(str(response.data), extra={'details': 'line no: ' + str(exc_traceback.tb_lineno)})
                else:
                    ins_logger.logger.error(str(response.data), extra={'details': 'No traceback available'})
                # ins_logger.logger.error(str(response.data), extra={'details': 'line no: ' + str(exc_traceback.tb_lineno)})

        except Exception as e:
            # response = exception_handler(exc, context)

            # # Log the exception
            # exc_type, exc_value, exc_traceback = exc_info()
            # ins_logger.logger.error(str(exc), extra={'details': 'line no: ' + str(exc_traceback.tb_lineno)})
            exc_type, exc_value, exc_traceback = exc_info()
            ins_logger.logger.error(str(e), extra={'details': 'line no: ' + str(exc_traceback.tb_lineno)})
        return response
