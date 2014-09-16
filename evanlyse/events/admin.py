from django.contrib import admin
from models import EventDefinition, EventInstance, Host

admin.site.register(EventDefinition)
admin.site.register(EventInstance)
admin.site.register(Host)

