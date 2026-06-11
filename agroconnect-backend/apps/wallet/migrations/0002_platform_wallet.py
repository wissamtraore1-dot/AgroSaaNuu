from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('wallet', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlatformWallet',
            fields=[
                ('id',                models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at',        models.DateTimeField(auto_now_add=True)),
                ('updated_at',        models.DateTimeField(auto_now=True)),
                ('nom',               models.CharField(default='AGROSAANUU', max_length=50, unique=True)),
                ('solde',             models.DecimalField(decimal_places=2, default=0.0, max_digits=16)),
                ('total_commissions', models.DecimalField(decimal_places=2, default=0.0, max_digits=16)),
                ('total_retire',      models.DecimalField(decimal_places=2, default=0.0, max_digits=16)),
            ],
            options={'db_table': 'platform_wallet'},
        ),
        migrations.CreateModel(
            name='PlatformTransaction',
            fields=[
                ('id',          models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at',  models.DateTimeField(auto_now_add=True)),
                ('updated_at',  models.DateTimeField(auto_now=True)),
                ('reference',   models.CharField(blank=True, max_length=25, unique=True)),
                ('type',        models.CharField(choices=[('COMMISSION', 'Commission perçue'), ('RETRAIT', 'Retrait entreprise'), ('AJUSTEMENT', 'Ajustement manuel')], max_length=15)),
                ('montant',     models.DecimalField(decimal_places=2, max_digits=12)),
                ('description', models.TextField(blank=True, default='')),
                ('commande_id', models.UUIDField(blank=True, null=True)),
                ('wallet',      models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transactions', to='wallet.platformwallet')),
            ],
            options={'db_table': 'platform_transactions', 'ordering': ['-created_at']},
        ),
    ]
