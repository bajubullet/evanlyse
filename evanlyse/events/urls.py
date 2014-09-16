from django.conf import urls
from events import views


urlpatterns = urls.patterns(
    '',
    urls.url(r'^$', views.home_view, name='home'),
    urls.url(r'^top_hosts/', views.top_hosts, name='top_hosts'),
    urls.url(r'^top_events/', views.top_events, name='top_events'),
    urls.url(r'^top_accounts/', views.top_accounts, name='top_accounts'),
    urls.url(r'^total_events/', views.total_events, name='total_events'),
    urls.url(r'^suspected_event/', views.suspected_event, name='suspected_event')
)
