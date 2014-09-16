import sys
import os

sys.path.append(os.path.dirname(os.path.realpath(__file__)) + '/../')


from StringIO import StringIO
from csv import DictReader
from events import models
import datetime

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


def import_event_instances(filename):
	data = get_dict_from_csv_string(open(filename).read())
	for row in data:
		try:
			print row
			defination = models.EventDefinition.objects.get(event_def_id=int(row['event_definition_id']))
			if defination:
				host = models.Host.objects.get_or_create(host_ip=row['host_ip'], host_name=row['host_name'])
				account = models.Account.objects.get_or_create(account_id=row['account_id'])
				instance = models.EventInstance(event_definition=defination,
												host=host,
												account=account,
												event_uuid=row['event_uuid'],
												object_id=row['object_id'],
												event_time=datetime.datetime(row['event_time']),
												event_receive_time=datetime.datetime(row['receive_time']),
												object_type=row['object_type'])
				instance.save()
		except Exception as ex:
			print ex


#import_event_definations('../data/EventDefinitions.csv')
import_event_instances('../data/2014-09-07.csv')