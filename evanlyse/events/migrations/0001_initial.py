# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('account_id', models.CharField(max_length=255, verbose_name='account id')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='EventDefinition',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('event_def_id', models.IntegerField(verbose_name='event definition field')),
                ('subsystem_id', models.IntegerField(verbose_name='subsystem field')),
                ('log_scope', models.SmallIntegerField(verbose_name='log scope')),
                ('is_active', models.BooleanField(verbose_name='is active')),
                ('name', models.CharField(max_length=255, verbose_name='name')),
                ('category', models.CharField(max_length=255, null=True, verbose_name='category', blank=True)),
                ('description', models.TextField(verbose_name='description')),
                ('is_portal_visible', models.BooleanField(verbose_name='is portal visible')),
                ('component', models.CharField(max_length=255, null=True, blank=True)),
                ('element', models.CharField(max_length=255, null=True, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='EventInstance',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('object_type', models.CharField(max_length=255, verbose_name='object type')),
                ('object_id', models.IntegerField(null=True, verbose_name='object id', blank=True)),
                ('event_time', models.DateTimeField(verbose_name='event time')),
                ('event_receive_time', models.DateTimeField(auto_now_add=True, verbose_name='event receive time')),
                ('host_ip', models.IPAddressField(verbose_name='host ip')),
                ('host_name', models.CharField(max_length=255, verbose_name='host name')),
                ('event_uuid', models.CharField(max_length=255)),
                ('account', models.ForeignKey(to='events.Account')),
                ('event_definition', models.ForeignKey(to='events.EventDefinition')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Portal',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255, verbose_name='name')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='eventdefinition',
            name='portal_tab',
            field=models.ForeignKey(to='events.Portal'),
            preserve_default=True,
        ),
    ]
