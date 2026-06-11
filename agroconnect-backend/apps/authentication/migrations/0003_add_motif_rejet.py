from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_add_verification_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='sellerprofile',
            name='motif_rejet',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='transporterprofile',
            name='motif_rejet',
            field=models.TextField(blank=True, default=''),
        ),
    ]
