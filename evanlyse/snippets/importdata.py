import sys
import os

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/../')


from StringIO import StringIO
from csv import DictReader
from events import models

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "evanlyse.settings")
import django
django.setup()


def get_dict_from_csv_string(str_csv):
    csvfile = StringIO(str_csv)
    data = DictReader(csvfile)
    result = []
    for row in data:
        result.append(row)
    return result

def import_event_definations(filename):
    data = get_dict_from_csv_string(open(filename).read())
    counter = 1
    for row in data:
        try:
            counter += 1
            portal_tab, _ = models.Portal.objects.get_or_create(name=row['portal_tab'])
            defination = models.EventDefinition(event_def_id=int(row['event_definition_id']),
                                   subsystem_id=int(row['subsystem_id']),
                                   log_scope=int(row['log_scope']),
                                   is_active=bool(row['active']),
                                   name=row['name'],
                                   category=row['category'],
                                   description=row['description'],
                                   portal_tab=portal_tab,
                                   is_portal_visible=row['portal_visible'])
            print defination.event_def_id
            defination.save()
            print '--'*34
        except Exception as ex:
            print ex
            print row['event_definition_id']
            pass
            # print row, ex


import_event_definations('../data/EventDefinitions.csv')
