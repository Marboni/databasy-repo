from databasyrepo.mq.client import RpcClient
from databasyrepo.mq.facade_subscriber import FacadeSubscriber

__author__ = 'Marboni'

_facade_rpc = None
_facade_sub = None

facade_rpc = lambda func, *args: _facade_rpc(func, *args)

def init_facade_clients(rpc_address, pub_address):
    global _facade_rpc
    _facade_rpc = RpcClient(rpc_address)

    global _facade_sub
    _facade_sub = FacadeSubscriber(pub_address)


