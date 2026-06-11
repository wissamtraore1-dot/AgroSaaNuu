from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='sellerprofile',
            name='est_verifie',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='sellerprofile',
            name='date_demande_verification',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='transporterprofile',
            name='est_verifie',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='transporterprofile',
            name='date_demande_verification',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
