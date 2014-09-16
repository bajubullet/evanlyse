import sys
import os

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/../')


from StringIO import StringIO
from csv import DictReader
from events import models
import datetime
import time
import pytz

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
            defination = models.EventDefinition(
                event_def_id=int(row['event_definition_id']),
                subsystem_id=int(row['subsystem_id']),
                log_scope=int(row['log_scope']),
                is_active=bool(row['active']),
                name=row['name'], category=row['category'],
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


def import_event_instances(filename):
        data = get_dict_from_csv_string(open(filename).read())
        print len(data)
        for i, row in enumerate(data):
                if i % 100 == 0:
                    print i
                try:
                        defination = models.EventDefinition.objects.get(
                            event_def_id=int(row['event_definition_id']))
                        if defination:
                                host, created = models.Host.objects.get_or_create(
                                    host_ip=row['host_ip'],
                                    host_name=row['host_name'])
                                if created:
                                    host.save()

                                account, created = models.Account.objects.get_or_create(
                                    account_id=row['account_id'])
                                if created:
                                    account.save()
                        else:
                            continue
                except Exception as ex:
                        print i
                        print ex

                try:
                    if row['object_id'] != 'None':
                        objId = int(row['object_id'])
                    else:
                        objId = None
                    instance = models.EventInstance(
                        event_definition=defination, host=host,
                        account=account,
                        event_uuid=row['event_uuid'],
                        object_id= objId,
                        event_time=datetime.datetime.strptime(
                            row['event_time'],
                            '%Y-%m-%d %H:%M:%S.%f'),
                        event_receive_time=datetime.datetime.strptime(
                            row['event_time'],
                            '%Y-%m-%d %H:%M:%S.%f'),
                        object_type=row['object_type'])
                    instance.save()
                except Exception as ex:
                        print type(row['event_time'])
                        print i
                        print ex

# import_event_definations('../data/EventDefinitions.csv')
# print 'Event defn imported'
# import_event_instances('../data/2014-09-07.csv')
# print '1 day complete'
import_event_instances('../data/2014-09-08.csv')
print '2 days complete'
import_event_instances('../data/2014-09-09.csv')
print '2 days complete'
