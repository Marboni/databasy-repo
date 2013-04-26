from functools import wraps
from flask.globals import request
import re

__author__ = 'Marboni'

TOKEN_HEX_REGEXP = re.compile(r'[0-9a-f]{32}')

### All fields validation ###

def validate_common(*common_validators):
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            error_messages = []
            for validator in common_validators:
                try:
                    validator()
                except InvalidStateError, e:
                    error_messages.append(e.message)
            if error_messages:
                raise ValidationError({'*': error_messages})
            return function(*args, **kwargs)

        return wrapper

    return decorator


class CommonValidator:
    def __init__(self):
        pass

    def __call__(self):
        raise NotImplementedError


class AcceptableFields(CommonValidator):
    def __init__(self, *fields):
        CommonValidator.__init__(self)
        self.fields = fields

    def __call__(self):
        unexpected_fields = set(request.values.keys()) - set(self.fields)
        if unexpected_fields:
            raise InvalidStateError('Unexpected fields: %s.' % ', '.join(unexpected_fields))


class Any(CommonValidator):
    def __call__(self):
        count = len(request.values)
        if not count:
            raise InvalidStateError('This call requires parameters.')


### Field validation ###

def validate(**validators):
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            values = dict(request.values.items() + kwargs.items())
            errors = {}
            for field, field_validator in validators.iteritems():
                field_errors = []
                try:
                    getattr(field_validator, '__top__')
                except AttributeError:
                    raise ValueError('Validator is not top-level.')
                try:
                    field_validator(field, values)
                except InvalidStateError, e:
                    field_errors.append(e.message)
                if field_errors:
                    errors[field] = field_errors
            if errors:
                raise ValidationError(errors)
            else:
                return function(*args, **kwargs)

        return wrapper

    return decorator


class FieldValidator(object):
    def __init__(self):
        pass

    def get(self, field, field_values):
        try:
            return field_values[field]
        except KeyError:
            raise ValueError('Field %s not exists.' % field)

    def __call__(self, field, field_values):
        pass


class Always(FieldValidator):
    __top__ = True

    def __init__(self, *validators, **kwargs):
        FieldValidator.__init__(self)
        self.validators = validators
        self.message = kwargs.get('message') or 'This field is required.'

    def __call__(self, field, field_values):
        value = field_values.get(field)
        if not value:
            raise InvalidStateError('Field is required.')
        for validator in self.validators:
            validator(field, field_values)


class IfNotNone(FieldValidator):
    __top__ = True

    def __init__(self, *validators):
        FieldValidator.__init__(self)
        self.validators = validators

    def __call__(self, field, field_values):
        value = field_values.get(field)
        if value is not None:
            for validator in self.validators:
                validator(field, field_values)


class IfOtherNone(FieldValidator):
    __top__ = True

    def __init__(self, other_field, *validators, **kwargs):
        FieldValidator.__init__(self)
        self.other_field = other_field
        self.validators = validators
        self.message = kwargs.get('message') or 'This field is required if field %s not specified.' % self.other_field

    def __call__(self, field, field_values):
        other_value = field_values.get(self.other_field)
        if not other_value:
            value = field_values.get(field)
            if not value:
                raise InvalidStateError(self.message)
            else:
                for validator in self.validators:
                    validator(field, field_values)


class Integer(FieldValidator):
    def __call__(self, field, field_values):
        try:
            int(self.get(field, field_values))
        except ValueError:
            raise InvalidStateError('Field must be integer.')


class Boolean(FieldValidator):
    def __call__(self, field, field_values):
        try:
            bool(self.get(field, field_values))
        except ValueError:
            raise InvalidStateError('Field must be boolean.')


class Length(FieldValidator):
    def __init__(self, min_length=None, max_length=None):
        FieldValidator.__init__(self)
        self.min_length = min_length
        self.max_length = max_length

    def __call__(self, field, field_values):
        value = self.get(field, field_values)
        if self.min_length and len(value) < self.min_length:
            raise InvalidStateError('Minimum length of this field is %s symbols.' % self.min_length)
        if self.max_length and len(value) > self.max_length:
            raise InvalidStateError('Maximum length of this field is %s symbols.' % self.max_length)


class ConditionIsFalse(FieldValidator):
    def __init__(self, condition_func, message):
        FieldValidator.__init__(self)
        self.exists_func = condition_func
        self.message = message

    def __call__(self, field, field_values):
        if self.exists_func(self.get(field, field_values)):
            raise InvalidStateError(self.message)


class ConditionIsTrue(FieldValidator):
    def __init__(self, condition_func, message):
        FieldValidator.__init__(self)
        self.exists_func = condition_func
        self.message = message


    def __call__(self, field, field_values):
        exists = self.exists_func(self.get(field, field_values))
        if not exists:
            raise InvalidStateError(self.message)


class Choice(FieldValidator):
    def __init__(self, correct_values):
        FieldValidator.__init__(self)
        self.correct_values = correct_values

    def __call__(self, field, field_values):
        if self.get(field, field_values) not in self.correct_values:
            raise InvalidStateError('Field can take only following values: %s.' %\
                                    ', '.join("'%s'" % correct_value for correct_value in self.correct_values))


class Regex(FieldValidator):
    def __init__(self, regex, regex_flags=0, message=None):
        FieldValidator.__init__(self)
        self.re = re.compile(regex, regex_flags)
        self.message = message or 'Incorrect field format.'

    def __call__(self, field, field_values):
        if not self.re.search(self.get(field, field_values)):
            raise InvalidStateError(self.message)

EMAIL_REGEX = r"(^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*" +\
              r'|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*"' +\
              r')@((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?$)' +\
              r'|\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$'
EMAIL_REGEX_FLAGS = re.IGNORECASE

class Email(FieldValidator):
    def pre_validators(self):
        return [
            Length(max_length=50),
            Regex(EMAIL_REGEX, EMAIL_REGEX_FLAGS, 'Invalid e-mail address.')
        ]


class CommaSeparatedEmails(FieldValidator):
    def __init__(self, message=None):
        FieldValidator.__init__(self)
        self.message = message

    def __call__(self, field, field_values):
        emails = [email.strip() for email in self.get(field, field_values).split(',')]
        email_regex = re.compile(EMAIL_REGEX, EMAIL_REGEX_FLAGS)
        for email in emails:
            if not email_regex.search(email):
                if not self.message:
                    self.message = 'Incorrect email format: %s.' % email
                raise InvalidStateError(self.message)


class Token(FieldValidator):
    def __init__(self, message=None):
        self.message = message or 'Invalid token.'
        FieldValidator.__init__(self)

    def pre_validators(self):
        return [
            Regex(TOKEN_HEX_REGEXP, 0, self.message)
        ]


class Iterable(FieldValidator):
    def __init__(self, min_length=None, max_length=None, message=None):
        FieldValidator.__init__(self)
        self.message = message or 'Field must be iterable.'
        self.min_length = min_length
        self.max_length = max_length

    def __call__(self, field, field_values):
        try:
            itr = iter(field_values[field])
        except TypeError:
            raise InvalidStateError(self.message)
        if self.min_length or self.max_length:
            length = sum(1 for _ in itr)
            if self.min_length and length < self.min_length:
                raise InvalidStateError('Field must contain at least %s elements.' % self.min_length)
            if self.max_length and length > self.max_length:
                raise InvalidStateError('Fields must contain not more then %s elements.' % self.max_length)



class InvalidStateError(Exception):
    def __init__(self, message):
        super(InvalidStateError, self).__init__(message)


class ValidationError(Exception):
    """ Creates validation error.
    Arguments:
        field_error_messages - dict of field names and lists of error messages.
    """

    def __init__(self, fields_error_messages):
        super(ValidationError, self).__init__('Parameters are invalid.')
        self.fields_error_messages = fields_error_messages
