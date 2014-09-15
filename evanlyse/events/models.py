from django.db import models
from django.utils.translation import ugettext_lazy as _


class Portal(models.Model):
    name = models.CharField(_('name'), max_length=255)

class EventDefinition(models.Model):
    event_def_id = models.IntegerField(_('event definition field'))
    subsystem_id = models.IntegerField(_('subsystem field'))
    log_scope = models.SmallIntegerField(_('log scope'))
    is_active = models.BooleanField(_('is active'))
    name = models.CharField(_('name'), max_length=255)
    category = models.CharField(_('category'), max_length=255, null=True, blank=True)
    description = models.TextField(_('description'))
    portal_tab = models.ForeignKey(Portal)
    is_portal_visible = models.BooleanField(_('is portal visible'))
    component = models.CharField(max_length=255, null=True, blank=True)
    element = models.CharField(max_length=255, null=True, blank=True)

class Account(models.Model):
    account_id = models.CharField(_('account id'), max_length=255, primary_key=True)

class EventInstance(models.Model):
    object_type = models.CharField(_('object type'), max_length=255)
    object_id = models.IntegerField(_('object id'), null=True, blank=True)
    account = models.ForeignKey(Account)
    event_time = models.DateTimeField(_('event time'))
    event_receive_time = models.DateTimeField(_('event receive time'), auto_now_add=True)
    event_definition = models.ForeignKey(EventDefinition)
    host = models.ForeignKey(Host)
    event_uuid = models.CharField(max_length=255)

class Host(models.Model):
    host_ip = models.IPAddressField(_('host ip'))
    host_name = models.CharField(_('host name'), max_length=255)