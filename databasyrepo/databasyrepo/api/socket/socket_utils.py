__author__ = 'Marboni'

def emit(ns_name, socket, event, *args):
    pkt = dict(type='event', name=event, args=args, endpoint=ns_name)
    socket.send_packet(pkt)
