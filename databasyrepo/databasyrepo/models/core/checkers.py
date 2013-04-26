from databasyrepo.models.core.nodes import Node

__author__ = 'Marboni'

class Error(Node):
    @classmethod
    def create(cls, node_id, field, error_code):
        error = cls()
        error['node_id'] = node_id
        error['field'] = field
        error['error_code'] = error_code
        return error

    def fields(self):
        fields = super(Error, self).fields()
        fields.update({
            'node_id': basestring,
            'field': basestring,
            'error_code': basestring
        })
        return fields

    def same(self, error):
        return self['node_id'] == error['node_id'] and \
               self['field'] == error['field'] and \
               self['error_code'] == error['error_code']


class Checker(object):
    def __init__(self, executor):
        super(Checker, self).__init__()
        self.executor = executor

    def error_codes(self):
        raise NotImplementedError

    def find_errors(self, model):
        raise NotImplementedError

    def modify_errors(self):
        model = self.executor.model
        existent_errors = [error for error in model.val_as_node('errors', model) if error.val('error_code') in self.error_codes()]
        found_errors = self.find_errors(model)

        # Remove errors that are in both existing and found lists. BTW, we leave only outdated errors in existing list
        # and only new in found.
        for fnd in found_errors[:]:
            for exs in existent_errors:
                if fnd.same(exs):
                    found_errors.remove(fnd)
                    existent_errors.remove(exs)
                    break

        from databasyrepo.models.core.actions import Register, Unregister, AppendItem, FindAndDeleteItem
        for error_to_delete in existent_errors:
            self.executor.execute(FindAndDeleteItem(field='errors', item=error_to_delete.ref()))
            self.executor.execute(Unregister(node_id=error_to_delete.id))
        for error_to_add in found_errors:
            self.executor.execute(Register(node=error_to_add))
            self.executor.execute(AppendItem(field='errors', item=error_to_add))


class UniqueTableNameChecker(Checker):
    TABLE_NAME_NOT_UNIQUE = 'error.table.name_not_unique'

    def error_codes(self):
        return [
            self.TABLE_NAME_NOT_UNIQUE
        ]

    def find_errors(self, model):
        table_name_and_ids = {}
        for table in model.val_as_node('tables', model):
            name = table.val('name')
            if not table_name_and_ids.has_key(name):
                table_name_and_ids[name] = []
            table_name_and_ids[name].append(table.id)

        errors = []
        for name, table_ids in table_name_and_ids.iteritems():
            if len(table_ids) > 1:
                for table_id in table_ids:
                    errors.append(Error.create(table_id, 'name', self.TABLE_NAME_NOT_UNIQUE))

        return errors