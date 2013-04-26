# coding=utf-8

__author__ = 'Marboni'

class Config(object):
    DEBUG = False
    TESTING = False

    PROPAGATE_EXCEPTIONS = True # All exceptions handled in middlewares.

    SITE_NAME = 'Databasy.com'

    MODULES = {
        '': 'databasyrepo.api.general',
        '/socket.io': 'databasyrepo.api.socket',
    }

    MIDDLEWARES = ()

    MONGO_URI = None
    MONGO_DATABASE_NAME = None

    SECRET_KEY = 'yxS3bDAEOF60OibRXbO5rcMUG6cyNezEwrQMKgsg'

class DevelopmentConfig(Config):
    ENV = 'development'

    DEBUG = True

    MONGO_URI = 'mongodb://localhost'
    MONGO_DATABASE_NAME = 'development'


class TestingConfig(Config):
    ENV = 'testing'

    MONGO_URI = 'mongodb://localhost'
    MONGO_DATABASE_NAME = 'testing'


class StagingConfig(Config):
    ENV = 'staging'

    MONGO_URI = 'mongodb://localhost'
    MONGO_DATABASE_NAME = 'staging'


class ProductionConfig(Config):
    ENV = 'production'

    MONGO_URI = 'mongodb://localhost'
    MONGO_DATABASE_NAME = 'production'

CONFIGS = [
    DevelopmentConfig,
    TestingConfig,
    StagingConfig,
    ProductionConfig
]
DEFAULT_CONFIG = DevelopmentConfig

def config_by_mode(config_mode):
    if not config_mode:
        return DEFAULT_CONFIG
    else:
        for config in CONFIGS:
            if config_mode == config.ENV:
                return config
        else:
            raise ValueError('Profile "%s" not defined. Check ODM_API_ENV environment variable.' % config_mode)