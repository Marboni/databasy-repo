import time

__author__ = 'Marboni'

def now():
    """ Current time in ms.
    """
    return int(round(time.time() * 1000))
