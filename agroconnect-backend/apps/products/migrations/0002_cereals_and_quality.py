# Generated migration for Products - Cereals & Quality Grade

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0001_initial'),
    ]

    operations = [
        # Update Categorie to cereals only choices
        migrations.AlterField(
            model_name='categorie',
            name='nom',
            field=models.CharField(
                choices=[
                    ('RIZ', 'Riz'),
                    ('MAIS', 'Maïs'),
                    ('MIL', 'Mil'),
                    ('SORGHO', 'Sorgho'),
                    ('ARACHIDES', 'Arachides'),
                    ('FONIO', 'Fonio'),
                    ('BLE', 'Blé'),
                    ('ORGE', 'Orge'),
                    ('HARICOTS', 'Haricots'),
                    ('LENTILLES', 'Lentilles'),
                    ('POIS_CHICHES', 'Pois chiches'),
                    ('NIEBE', 'Niébé'),
                ],
                max_length=100,
                unique=True
            ),
        ),
        
        # Add quality grade fields to Produit
        migrations.AddField(
            model_name='produit',
            name='grade_qualite',
            field=models.CharField(
                choices=[('A', 'Grade A - Supérieur'), ('B', 'Grade B - Bon'), ('C', 'Grade C - Acceptable')],
                default='B',
                max_length=1
            ),
        ),
        migrations.AddField(
            model_name='produit',
            name='date_recolte',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='produit',
            name='lieu_origine',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
    ]
