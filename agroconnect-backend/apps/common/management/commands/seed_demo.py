from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.authentication.models import SellerProfile, User
from apps.news.models import Actualite, CategorieActualite
from apps.products.models import Categorie, Produit


class Command(BaseCommand):
    help = 'Cree des donnees de demonstration dynamiques pour AgroSaaNuu.'

    def handle(self, *args, **options):
        seller, created = User.objects.get_or_create(
            email='vendeur.demo@agrosaanuu.local',
            defaults={
                'telephone': '+2290197000001',
                'prenom': 'Moussa',
                'nom': 'Demo',
                'cip': '97000001',
                'role': User.Role.SELLER,
                'status': User.Status.ACTIVE,
                'is_verified': True,
                'ville': 'Parakou',
            },
        )
        if created:
            seller.set_password('Demo12345!')
            seller.save(update_fields=['password'])
        SellerProfile.objects.get_or_create(user=seller, defaults={'association': 'Cooperative demo'})

        admin, created = User.objects.get_or_create(
            email='redaction@agrosaanuu.local',
            defaults={
                'telephone': '+2290197000002',
                'prenom': 'Redaction',
                'nom': 'AgroSaaNuu',
                'cip': '97000002',
                'role': User.Role.ADMIN,
                'status': User.Status.ACTIVE,
                'is_verified': True,
                'ville': 'Cotonou',
                'is_staff': True,
            },
        )
        if created:
            admin.set_password('Demo12345!')
            admin.save(update_fields=['password'])

        product_categories = {}
        for name, icon in [('Mais', 'corn'), ('Riz', 'rice'), ('Soja', 'seed'), ('Mil', 'grain')]:
            product_categories[name], _ = Categorie.objects.get_or_create(
                nom=name,
                defaults={'description': f'Produits agricoles: {name}', 'icone': icon},
            )

        products = [
            ('Mais blanc 2t', 'Mais', 'Bankoura', 'Parakou', Decimal('1000000.00'), Decimal('2.00')),
            ('Riz local 3t', 'Riz', 'Parakou', 'Parakou', Decimal('1160000.00'), Decimal('3.00')),
            ('Soja certifie 1t', 'Soja', 'Nikki', 'Nikki', Decimal('670000.00'), Decimal('1.00')),
            ('Mil rouge 2t', 'Mil', 'Natitingou', 'Natitingou', Decimal('800000.00'), Decimal('2.00')),
        ]
        for nom, category, localisation, ville, prix, quantite in products:
            Produit.objects.update_or_create(
                nom=nom,
                vendeur=seller,
                defaults={
                    'categorie': product_categories[category],
                    'description': f'{nom} disponible pour commande via AgroSaaNuu.',
                    'prix': prix,
                    'unite': Produit.Unite.TONNE,
                    'quantite': quantite,
                    'localisation': localisation,
                    'ville': ville,
                    'statut': Produit.Statut.ACTIF,
                    'est_disponible': True,
                },
            )

        news_categories = {}
        for name, color in [('Marche', '#1a5c2a'), ('Agriculture', '#2d8c47'), ('Formation', '#2563eb')]:
            news_categories[name], _ = CategorieActualite.objects.get_or_create(
                nom=name,
                defaults={'couleur': color},
            )

        articles = [
            (
                'Hausse des prix des cereales au nord Benin',
                'Les marches agricoles connaissent une forte demande cette semaine.',
                'Le prix du mais et du riz progresse dans plusieurs communes. Les producteurs anticipent une meilleure marge, pendant que les acheteurs cherchent des offres fiables.',
                'Marche',
                True,
                ['Prix', 'Cereales', 'Benin'],
            ),
            (
                'Formation numerique pour jeunes agriculteurs',
                'Un nouveau programme accompagne les producteurs vers les outils digitaux.',
                'La formation presente les bases de la vente en ligne, du suivi de commandes et de la gestion de portefeuille mobile.',
                'Formation',
                False,
                ['Formation', 'Numerique'],
            ),
            (
                'Nouvelles pratiques d irrigation pour le riz',
                'Des producteurs experimentent des techniques plus economes en eau.',
                'Les premiers resultats montrent une meilleure stabilite des rendements et une reduction des pertes pendant les periodes seches.',
                'Agriculture',
                False,
                ['Riz', 'Irrigation'],
            ),
        ]
        for titre, extrait, contenu, category, vedette, tags in articles:
            Actualite.objects.update_or_create(
                titre=titre,
                defaults={
                    'auteur': admin,
                    'categorie': news_categories[category],
                    'extrait': extrait,
                    'contenu': contenu,
                    'statut': Actualite.Statut.PUBLIE,
                    'est_vedette': vedette,
                    'tags': tags,
                },
            )

        self.stdout.write(self.style.SUCCESS('Donnees de demonstration creees ou mises a jour.'))
