from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_code = getattr(exc, 'default_code', 'error')
        response.data = {
            'error': error_code,
            'message': _extract_message(response.data),
            'details': response.data if isinstance(response.data, dict) else {},
        }

    return response


def _extract_message(data):
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        first_key = next(iter(data), None)
        if first_key:
            val = data[first_key]
            if isinstance(val, list):
                return str(val[0])
            return str(val)
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data)


class SubscriptionExpired(APIException):
    status_code = 403
    default_detail = 'Subscription has expired.'
    default_code = 'subscription_expired'


class DeviceLimitReached(APIException):
    status_code = 403
    default_detail = 'Maximum device limit reached.'
    default_code = 'device_limit_reached'


class PaymentFailed(APIException):
    status_code = 400
    default_detail = 'Payment processing failed.'
    default_code = 'payment_failed'
