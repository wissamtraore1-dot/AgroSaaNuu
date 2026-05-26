from django.contrib.auth.models import BaseUserManager

class UserManager(BaseUserManager):

    def create_user(self, telephone=None, email=None, password=None, **extra_fields):
        """Créer utilisateur avec téléphone OU email"""
        if not telephone and not email:
            raise ValueError('Le téléphone ou email est obligatoire')
        
        if email:
            email = self.normalize_email(email)
        
        user = self.model(telephone=telephone, email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff',     True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active',    True)
        extra_fields.setdefault('is_verified',  True)
        extra_fields.setdefault('phone_verified', True)
        extra_fields.setdefault('role',         'ADMIN')
        extra_fields.setdefault('prenom',       'Admin')
        extra_fields.setdefault('nom',          'AgroConnect')
        extra_fields.setdefault('cip',          '00000000')
        extra_fields.setdefault('telephone',    '+2290197000000')
        return self.create_user(telephone='+2290197000000', email=email, password=password, **extra_fields)
