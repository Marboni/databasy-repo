__author__ = 'Marboni'

class DeserializationException(Exception):
    pass

class IllegalCommand(Exception):
    pass

class ModelNotFound(Exception):
    def __init__(self, model_id):
        super(ModelNotFound, self).__init__('Model with ID %s not found.')
        self.model_id = model_id

class IllegalClientModelVersion(Exception):
    pass

class Conflict(Exception):
    pass