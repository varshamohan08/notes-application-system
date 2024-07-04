from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from sys import exc_info
from utils import ins_logger

def custom_exception_handler(exc, context):
    import pdb;pdb.set_trace()
    response = exception_handler(exc, context)

    # Log the exception
    exc_type, exc_value, exc_traceback = exc_info()
    ins_logger.logger.error(str(exc), extra={'details': 'line no: ' + str(exc_traceback.tb_lineno)})

    if response is None:
        response_data = {
            "details": str(exc),
            "success": False
        }
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    response.data['success'] = False
    # response.data['details'] = str(exc)

    return response
