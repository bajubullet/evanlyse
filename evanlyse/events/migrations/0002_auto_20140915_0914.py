# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Host',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('host_ip', models.IPAddressField(verbose_name='host ip')),
                ('host_name', models.CharField(max_length=255, verbose_name='host name')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='account',
            name='id',
        ),
        migrations.AlterField(
            model_name='account',
            name='account_id',
            field=models.CharField(max_length=255, serialize=False, verbose_name='account id', primary_key=True),
        ),
    ]
