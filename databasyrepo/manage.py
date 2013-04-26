import argparse
import sys
from databasyrepo import config

__author__ = 'Marboni'

def recreatedb(mode=None):
    """ Recreates DB.
    mode - application mode: 'development', 'testing', 'staging', 'production'. If None, value will be taken from
    ODM_API_ENV environment variable.
    """
    current_config = config.config_by_mode(mode)
    from databasyrepo.mg import recreatedb as recreate_mongo
    recreate_mongo(current_config.MONGO_URI, current_config.MONGO_DATABASE_NAME)
    print '\nDatabase recreated: %s/%s.' % (current_config.MONGO_URI, current_config.MONGO_DATABASE_NAME)

COMMANDS = {
    'recreatedb': {
        'method': recreatedb,
        'format': 'recreatedb [mode]',
        'help': 'recreates database. Optional parameter \'mode\' takes following values: '
                'development, testing, staging, production.',
        }
}

def print_list():
    help = 'Available commands:\n'
    for command, meta in COMMANDS.iteritems():
        help += meta['format'].ljust(40) + ' ' + meta['help'] + '\n'
    print help

parser = argparse.ArgumentParser(description='Executes service commands.')
parser.add_argument('command', metavar='cmd', nargs='?', choices=COMMANDS.keys(), help='command to execute')
parser.add_argument('arguments', metavar='arg', nargs='*', help='parameters of command')
parser.add_argument('-l', '--list', action='store_true', help='prints list of all available commands')

if __name__ == "__main__":
    p = parser.parse_args(sys.argv[1:])
    if p.list:
        print_list()
    elif not p.command:
        print 'Command not specified.\n'
        print_list()
    else:
        command_meta = COMMANDS[p.command]
        command_meta['method'](*p.arguments)
