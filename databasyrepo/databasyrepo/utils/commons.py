import collections
import threading
import time

__author__ = 'Marboni'

class DictDiffer(object):
    """
    Calculate the difference between two dictionaries as:
    (1) items added
    (2) items removed
    (3) keys same in both but changed values
    (4) keys same in both and unchanged values

    http://stackoverflow.com/questions/1165352/fast-comparison-between-two-python-dictionary
    """

    def __init__(self, current_dict, past_dict):
        self.current_dict, self.past_dict = current_dict, past_dict
        self.set_current, self.set_past = set(current_dict.keys()), set(past_dict.keys())
        self.intersect = self.set_current.intersection(self.set_past)

    def added(self):
        return self.set_current - self.intersect

    def removed(self):
        return self.set_past - self.intersect

    def changed(self):
        return set(o for o in self.intersect if self.past_dict[o] != self.current_dict[o])

    def unchanged(self):
        return set(o for o in self.intersect if self.past_dict[o] == self.current_dict[o])

    def are_equal(self):
        return not self.added() and not self.removed() and not self.changed()


def itersubclasses(cls, _seen=None):
    """
    itersubclasses(cls)

    Generator over all subclasses of a given class, in depth first order.

    >>> list(itersubclasses(int)) == [bool]
    True
    >>> class A(object): pass
    >>> class B(A): pass
    >>> class C(A): pass
    >>> class D(B,C): pass
    >>> class E(D): pass
    >>>
    >>> for cls in itersubclasses(A):
    ...     print(cls.__name__)
    B
    D
    E
    C
    >>> # get ALL (new-style) classes currently defined
    >>> [cls.__name__ for cls in itersubclasses(object)] #doctest: +ELLIPSIS
    ['type', ...'tuple', ...]
    """

    if not isinstance(cls, type):
        raise TypeError('itersubclasses must be called with '
                        'new-style classes, not %.100r' % cls)
    if _seen is None: _seen = set()
    try:
        subs = cls.__subclasses__()
    except TypeError: # fails only when cls is type
        subs = cls.__subclasses__(cls)
    for sub in subs:
        if sub not in _seen:
            _seen.add(sub)
            yield sub
            for sub in itersubclasses(sub, _seen):
                yield sub


def current_time_sec():
    return round(time.time())


def current_time_ms():
    return long(round(time.time() * 1000))


class ReadWriteLock(object):
    """ Locks that allow multiple readers, but only one writer in the same time.
    """

    def __init__(self):
        self._read_ready = threading.Condition(threading.Lock())
        self._readers = 0

    def acquire_read(self):
        """ Acquires a read lock. Block only if a thread has acquired a write lock.
        """
        self._read_ready.acquire()
        try:
            self._readers += 1
        finally:
            self._read_ready.release()

    def release_read(self):
        """ Releases a read lock.
        """
        self._read_ready.acquire()
        try:
            self._readers -= 1
            if not self._readers:
                self._read_ready.notifyAll()
        finally:
            self._read_ready.release()

    def acquire_write(self):
        """ Acquires a write lock. Blocks until there are no acquired read or write locks.
        """
        self._read_ready.acquire()
        while self._readers > 0:
            self._read_ready.wait()

    def release_write(self):
        """ Release a write lock.
        """
        self._read_ready.release()


class ExpireCounter:
    """Tracks how many events were added in the preceding time period
    """
    def __init__(self, timeout=1):
        self.lock = threading.Lock()
        self.timeout = timeout
        self.events = collections.deque([])

    def add(self, item):
        """Add event time
        """
        with self.lock:
            self.events.append(item)
            timer = threading.Timer(self.timeout, self._expire)
            timer.daemon = True
            timer.start()

    def _expire(self):
        """Remove any expired events
        """
        with self.lock:
            self.events.popleft()

    def __len__(self):
        """Return number of active events
        """
        with self.lock:
            return len(self.events)

    def __str__(self):
        with self.lock:
            return str(self.events)