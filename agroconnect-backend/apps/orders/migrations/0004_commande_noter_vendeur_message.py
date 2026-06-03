from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0003_alter_paiement_id_alter_retaitvendeur_id'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Champs évaluation vendeur sur Commande
        migrations.AddField(
            model_name='commande',
            name='note_vendeur',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='commande',
            name='commentaire_vendeur',
            field=models.TextField(blank=True, default=''),
        ),
        # Nouveau modèle Message
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id',          models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at',  models.DateTimeField(auto_now_add=True)),
                ('updated_at',  models.DateTimeField(auto_now=True)),
                ('contenu',     models.TextField()),
                ('est_lu',      models.BooleanField(default=False)),
                ('commande',    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages',   to='orders.commande')),
                ('expediteur',  models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages_envoyes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'messages_commande',
                'ordering': ['created_at'],
            },
        ),
    ]
