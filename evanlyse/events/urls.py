from django.conf import urls
from events import views


urlpatterns = urls.patterns(
    '',
    urls.url(r'^$', views.home_view, name='home')
)
