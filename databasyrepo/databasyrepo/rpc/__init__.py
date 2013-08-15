from databasyrepo.rpc.client import RpcClient

__author__ = 'Marboni'

_facade_rpc = None

facade_rpc = lambda func, *args: _facade_rpc(func, *args)

def init_facade_rpc_client(address):
    global _facade_rpc
    _facade_rpc = RpcClient(address)


