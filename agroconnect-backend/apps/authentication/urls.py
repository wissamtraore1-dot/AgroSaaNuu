from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from . import sms_auth_views

app_name = 'authentication'

urlpatterns = [
    # ===== ANCIENNES ROUTES =====
    path('inscription/',              views.InscriptionView.as_view(), name='inscription'),
    path('connexion/',                views.ConnexionView.as_view(), name='connexion'),
    path('deconnexion/',              views.DeconnexionView.as_view(), name='deconnexion'),
    path('token/refresh/',            TokenRefreshView.as_view(), name='token-refresh'),
    path('profil/',                   views.MonProfilView.as_view(), name='mon-profil'),
    path('changer-mot-de-passe/',     views.ChangerMotDePasseView.as_view(), name='changer-mot-de-passe'),
    path('otp/envoyer/',              views.EnvoyerOTPView.as_view(), name='envoyer-otp'),
    path('otp/verifier/',             views.VerifierOTPView.as_view(), name='verifier-otp'),
    path('reinitialisation-mdp/',     views.ReinitialisationMDPView.as_view(), name='reinitialisation-mdp'),
    path('confirmer-reinitialisation/', views.ConfirmerReinitialisationView.as_view(), name='confirmer-reinitialisation'),
    
    # ===== NOUVELLES ROUTES SMS/PHONE AUTH =====
    path('sms/request-otp/',          sms_auth_views.RequestOTPView.as_view(), name='request-otp'),
    path('sms/verify-and-register/',  sms_auth_views.VerifyOTPAndCreateAccountView.as_view(), name='verify-otp'),
    path('sms/phone-login/',          sms_auth_views.PhoneLoginView.as_view(), name='phone-login'),
    path('sms/resend-otp/',           sms_auth_views.ResendOTPView.as_view(), name='resend-otp'),
    path('complete-profile/',         sms_auth_views.CompleteProfileView.as_view(), name='complete-profile'),
    
    # ===== PROFILS SPÉCIALISÉS =====
    path('seller-profile/',           views.SellerProfileView.as_view(), name='seller-profile'),
    path('transporter-profile/',      views.TransporterProfileView.as_view(), name='transporter-profile'),

    # ===== KYC VERIFICATION ENDPOINTS =====
    path('kyc/upload-document/',      views.UploadKYCDocumentView.as_view(), name='upload-kyc-document'),
    path('kyc/status/',               views.GetKYCStatusView.as_view(), name='get-kyc-status'),
    path('kyc/admin-verify/',         views.AdminVerifyKYCView.as_view(), name='admin-verify-kyc'),
]
