import threading
import zmq

__author__ = 'Marboni'

class RpcClient(object):
    def __init__(self, address):
        self.address = address
        self.context = zmq.Context()

    def __call__(self, func, *args):
        request = {
            'func': func,
            'args': args
        }
        socket = self.context.socket(zmq.REQ)
        socket.connect(self.address)
        socket.send_pyobj(request)
        response = socket.recv_pyobj()

        if response['status'] == 'ERROR':
            e = response['error']
            raise e
        else:
            return response['result']


class Subscriber(object):
    """ Subclasses should define methods exec_<command>(*args) to handle commands. If no method found,
        exec(command, *args) will be called.
    """

    def __init__(self, address):
        super(Subscriber, self).__init__()
        self.address = address
        context = zmq.Context()
        self.socket = context.socket(zmq.SUB)
        self.socket.setsockopt(zmq.SUBSCRIBE, '')
        self.socket.connect(address)

    def subscribe(self):
        while True:
            command_and_args = self.socket.recv_pyobj()
            command = command_and_args['command']
            args = command_and_args['args']
            try:
                try:
                    method = getattr(self, 'exec_%s' % command)
                except AttributeError:
                    self.execute(command, *args)
                else:
                    method(*args)
            except Exception, e:
                self.error_handler(e)

    def execute(self, command, *args):
        pass

    def error_handler(self, e):
        pass

    def run(self):
        t = threading.Thread(target=self.subscribe, name='subscriber')
        t.daemon = True
        t.start()

    def disconnect(self):
        self.socket.disconnect(self.address)