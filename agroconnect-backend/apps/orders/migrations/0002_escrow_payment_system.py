# Generated migration for Orders - ESCROW payment system

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0001_initial'),
    ]

    operations = [
        # Update Commande status choices to include escrow statuses
        migrations.AlterField(
            model_name='commande',
            name='statut',
            field=models.CharField(
                choices=[
                    ('PAIEMENT_EN_ATTENTE', 'Paiement en attente'),
                    ('PAIEMENT_RECU', 'Paiement reçu (en escrow)'),
                    ('EN_PREPARATION', 'En préparation'),
                    ('EN_LIVRAISON', 'En cours de livraison'),
                    ('LIVREE', 'Livrée'),
                    ('CONFIRMEE_RECEPTION', 'Réception confirmée'),
                    ('PAIEMENT_LIBERE', 'Paiement libéré au vendeur'),
                    ('ANNULEE', 'Annulée'),
                    ('LITIGE', 'En litige'),
                ],
                default='PAIEMENT_EN_ATTENTE',
                max_length=30
            ),
        ),
        
        # Add escrow tracking fields to Commande
        migrations.AddField(
            model_name='commande',
            name='paiement_en_escrow',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='commande',
            name='paiement_libere_le',
            field=models.DateTimeField(blank=True, null=True),
        ),
        
        # Create Paiement model
        migrations.CreateModel(
            name='Paiement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('montant', models.DecimalField(decimal_places=2, max_digits=12)),
                ('mode_paiement', models.CharField(
                    choices=[
                        ('MTN', 'MTN Mobile Money'),
                        ('MOOV', 'Moov Money'),
                        ('CELTIS', 'Celtis Cash'),
                        ('BANK', 'Virement bancaire'),
                    ],
                    max_length=10
                )),
                ('statut', models.CharField(
                    choices=[
                        ('EN_ATTENTE', 'En attente'),
                        ('EFFECTUE', 'Effectué'),
                        ('EN_ESCROW', 'En escrow (bloqué)'),
                        ('PRET_VENDEUR', 'Prêt pour retrait vendeur'),
                        ('TRANSFERE', 'Transféré au vendeur'),
                        ('ECHOUE', 'Échoué'),
                        ('REMBOURSÉ', 'Remboursé'),
                    ],
                    default='EN_ATTENTE',
                    max_length=20
                )),
                ('reference_transaction', models.CharField(blank=True, max_length=100, null=True)),
                ('date_recu', models.DateTimeField(blank=True, null=True)),
                ('date_en_escrow', models.DateTimeField(blank=True, null=True)),
                ('date_transfere', models.DateTimeField(blank=True, null=True)),
                ('message_erreur', models.TextField(blank=True, default='')),
                ('log_webhook', models.JSONField(blank=True, default=dict)),
                ('commande', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='paiement', to='orders.commande')),
            ],
            options={
                'db_table': 'paiements',
                'ordering': ['-created_at'],
            },
        ),
        
        # Create RetaitVendeur model
        migrations.CreateModel(
            name='RetaitVendeur',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('montant', models.DecimalField(decimal_places=2, max_digits=12)),
                ('statut', models.CharField(
                    choices=[
                        ('DEMANDE', 'Demandé'),
                        ('APPROUVE', 'Approuvé'),
                        ('TRAITEMENT', 'En traitement'),
                        ('EFFECTUE', 'Effectué'),
                        ('REJETE', 'Rejeté'),
                    ],
                    default='DEMANDE',
                    max_length=20
                )),
                ('compte_bancaire', models.CharField(max_length=50)),
                ('nom_titulaire', models.CharField(max_length=200)),
                ('date_demande', models.DateTimeField(auto_now_add=True)),
                ('date_approuvé', models.DateTimeField(blank=True, null=True)),
                ('date_effectué', models.DateTimeField(blank=True, null=True)),
                ('reference_virement', models.CharField(blank=True, max_length=100, null=True)),
                ('notes', models.TextField(blank=True, default='')),
                ('vendeur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='retraits', to='authentication.user')),
            ],
            options={
                'db_table': 'retraits_vendeur',
                'ordering': ['-created_at'],
            },
        ),
    ]
