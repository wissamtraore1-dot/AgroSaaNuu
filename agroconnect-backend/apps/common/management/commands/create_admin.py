import getpass
from django.core.management.base import BaseCommand, CommandError
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Crée ou réinitialise le compte superadmin'

    def add_arguments(self, parser):
        parser.add_argument('--email',    default='Wissamtraore1@gmail.com')
        parser.add_argument('--prenom',   default='Wissam')
        parser.add_argument('--nom',      default='Traoré')
        parser.add_argument('--tel',      default='+22961000000')
        parser.add_argument('--password', default=None)

    def handle(self, *args, **options):
        email   = options['email']
        prenom  = options['prenom']
        nom     = options['nom']
        tel     = options['tel']
        pwd     = options['password']

        # Supprimer l'ancien admin avec ce mail ou ce téléphone
        deleted, _ = User.objects.filter(email__iexact=email).delete()
        if deleted:
            self.stdout.write(self.style.WARNING(f'Ancien compte supprimé : {email}'))

        # Supprimer aussi si téléphone déjà utilisé
        User.objects.filter(telephone=tel).delete()

        # Demander le mot de passe si non fourni
        if not pwd:
            pwd = getpass.getpass('Mot de passe admin : ')
            pwd2 = getpass.getpass('Confirmer le mot de passe : ')
            if pwd != pwd2:
                raise CommandError('Les mots de passe ne correspondent pas.')
            if len(pwd) < 8:
                raise CommandError('Le mot de passe doit faire au moins 8 caractères.')

        # Créer le superadmin
        user = User.objects.create_superuser(
            email=email,
            password=pwd,
            prenom=prenom,
            nom=nom,
            telephone=tel,
            cip='00000001',
        )

        self.stdout.write(self.style.SUCCESS(
            f'\nSuperadmin cree avec succes !'
            f'\n  Email  : {user.email}'
            f'\n  Role   : {user.role}'
            f'\n\n  Admin  : http://localhost:8000/admin/'
            f'\n  Login  : {user.email}'
        ))
