# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0002_auto_20140915_0914'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='eventinstance',
            name='host_ip',
        ),
        migrations.RemoveField(
            model_name='eventinstance',
            name='host_name',
        ),
        migrations.AddField(
            model_name='eventinstance',
            name='host',
            field=models.ForeignKey(default=None, to='events.Host'),
            preserve_default=False,
        ),
    ]
