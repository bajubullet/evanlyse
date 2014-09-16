import models
import datetime

from django.db.models import Count


def get_events_by_account(account_id):
    """Returns events for given account

    Args:
        account_id: The string account ID.

    Returns:
        A queryset or EventInstance objects.
    """
    return models.EventInstance.objects.filter(account__account_id=account_id)

def get_events_by_date(after, before):
    """Returns events in given time range.

    Args:
        after: Datetime string e.g 2011-01-01.
        before: Datetime string e.g 2011-01-01.

    Returns:
        A queryset or EventInstance objects.
    """
    return models.EventInstance.objects.filter(event_time__range=[after, before])


def get_events_by_event_name(name):
    """Returns events with given event name.

    Args:
        name: The given event name.

    Returns:
        A queryset or EventInstance objects.
    """
    return models.EventInstance.objects.filter(event__name=name)


def get_events_by_log_scope(log_scope):
    """Returns events with given log scope.

    Args:
        log_scope: The given log scope.

    Returns:
        A queryset or EventInstance objects.
    """
    return models.EventInstance.objects.filter(event__log_scope=log_scope)


def get_events_by_log_scope(portal):
    """Returns events with given portal.

    Args:
        portal: The given portal name.

    Returns:
        A queryset or EventInstance objects.
    """
    return models.EventInstance.objects.filter(event__portal__name=portal)


def get_events_for_active_events():
    """Returns events for active event definitions.

    Returns:
        A queryset or EventInstance objects.
    """
    return models.EventInstance.objects.filter(event__is_active=True)


def get_events_for_accounts(accounts):
    """Returns events for list of accounts.

    Returns:
        A queryset or EventInstance objects.
    """
    return models.EventInstance.objects.filter(account__in=accounts)


def get_events_count_by_type(accounts=None, host_ips=None, host_names=None):
    """Returns event count by event_def_id.

    Returns:
        A list of event def id and their counts.
    """
    events = models.EventInstance.objects.all()
    if accounts is not None:
        events = events.filter(account__in=accounts)

    if host_ips is not None:
        events = events.filter(host__host_ip__in=host_ips)

    if host_names is not None:
        events = events.filter(host__host_name__in=host_names)

    events = events.values(
        'event_def_id').annotate(event_count=Count('event_def_id'))
    return events


def top_hosts(n=10, by_most_events=True):
    events = models.EventInstance.objects.values(
        'host').annotate(host_count=Count('host')).order_by('-host_count')
    if by_most_events is True:
        return events[:n]
    else:
        return events[-n:]


def top_accounts(n=10, by_most_events=True):
    events = models.EventInstance.objects.values(
        'account').annotate(account_count=Count('account')).order_by('-account_count')
    if by_most_events is True:
        return events[:n]
    else:
        return events[-n:]


def top_events(account_id, n=10):
    try:
        account = models.Account.objects.get(account_id=account_id)
    except:
        return {}

    days_tuples = [
        (datetime.datetime(2014, 9, 7),
         datetime.datetime(2014, 9, 8)),
        (datetime.datetime(2014, 9, 8),
         datetime.datetime(2014, 9, 9)),
        (datetime.datetime(2014, 9, 9),
         datetime.datetime(2014, 9, 10))
    ]
    result = {}
    for from_date, to_date in days_tuples:
        values = models.EventInstance.objects.filter(
            account=account, event_time__range=(from_date, to_date)).values(
                'event_definition').annotate(
                    defn_count=Count('event_definition')).order_by(
                        'defn_count')[:10]
        values = [{
            'name': val['event_definition'],
            'count': val['defn_count']} for val in values]
        result[from_date] = values

    return result
