from django import shortcuts
from django import template
from django.http import HttpResponse

import controllers
import datetime
import json


def home_view(request):
    response = shortcuts.render_to_response(
        'test_resp.html',
        context_instance=template.RequestContext(request))
    return response


def all_accounts(request):
    account_data = controllers.get_all_accounts()
    response = shortcuts.render_to_response(
        'all_accounts.html',
        context_instance=template.RequestContext(request, {
            'accounts': account_data
        }))
    return response

def top_hosts(request):
    by_most_events = request.GET.get('by_most_events')
    by_most_events = False if by_most_events == 'False' else True
    host_data = controllers.top_hosts(by_most_events=by_most_events)
    response = shortcuts.render_to_response(
        'top_hosts.html',
        controllers.top_hosts(by_most_events=by_most_events),
        context_instance=template.RequestContext(request),
        content_type="application/json")
    return response


def top_accounts(request):
    by_most_events = request.GET.get('by_most_events', True)
    by_most_events = False if by_most_events == 'False' else True
    account_data = controllers.top_accounts(by_most_events=by_most_events)
    response = shortcuts.render_to_response(
        'top_accounts.html',
        context_instance=template.RequestContext(request, {
            'accounts': account_data
        }),
        content_type="application/json")
    return response


def total_events(request):
    events = controllers.get_all_event_count()
    active_events = controllers.get_events_for_active_events()
    response = shortcuts.render_to_response(
        'total_events.json',
        {'events': events, 'active': active_events},
        context_instance=template.RequestContext(request),
        content_type="application/json")
    return response


def suspected_event(request):
    account_id = request.GET.get('account_id')
    event = controllers.suspected_event(account_id)[:1][0]
    r = {'event': event.name, 'description': event.description}
    return HttpResponse( json.dumps( r ) )

def top_events(request):
    account_id = request.GET.get('account', '')
    events = controllers.top_events(account_id)
    response = shortcuts.render_to_response(
        'top_events.html',
        context_instance=template.RequestContext(
            request, {'events': events}))
    return response
