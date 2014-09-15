import models


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