from django import shortcuts
from django import template

# Create your views here.

def home_view(request):
    response = shortcuts.render_to_response(
        'test_resp.html',
        context_instance=template.RequestContext(request))
    return response

