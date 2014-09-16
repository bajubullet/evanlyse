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
    return models.EventInstance.objects.filter(event_definition__is_active=True).count()


def get_all_event_count():
    """Returns all events.

    Returns:
        A queryset or EventInstance objects.
    """
    return models.EventInstance.objects.count()


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
        'host__host_name').annotate(host_count=Count('host')).order_by('-host_count')
    if by_most_events is True:
        events = events.order_by('-host_count')
        return events[:n]
    else:
        events = events.order_by('host_count')
        return events[:n]


def top_accounts(n=10, by_most_events=True):
    events = models.EventInstance.objects.values(
        'account').annotate(account_count=Count('account'))
    if by_most_events is True:
        events = events.order_by('-account_count')
        return events[:n]
    else:
        events = events.order_by('account_count')
        return events[:n]


def suspected_event(account_id):
    events = get_events_by_account(account_id)
    current_hour = datetime.datetime.now().hour
    top_events = {}
    tmp_event_id = None
    for event in events:
        if not tmp_event_id:
            tmp_event_id = event.event_definition.event_def_id
        if event.event_time.hour == current_hour:
            count = top_events.get(event.event_definition.event_def_id, 0)
            top_events[event.event_definition.event_def_id] = count + 1
    if not top_events:
        event_id = tmp_event_id
    else:
        top_events = sorted(top_events.iteritems(), key=top_events.get)
        event_id = top_events[-1][0]
    return models.EventDefinition.objects.filter(event_def_id=tmp_event_id)
