from rest_framework.permissions import BasePermission


class IsBuyer(BasePermission):
    message = 'Accès réservé aux acheteurs.'
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'BUYER'


class IsSeller(BasePermission):
    message = 'Accès réservé aux vendeurs.'
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SELLER'


class IsTransporter(BasePermission):
    message = 'Accès réservé aux transporteurs.'
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'TRANSPORTER'


class IsAdminUser(BasePermission):
    message = 'Accès réservé aux administrateurs.'
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'


class IsVerifiedUser(BasePermission):
    message = 'Identité non vérifiée.'
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_verified


class IsSellerOrAdmin(BasePermission):
    message = 'Accès réservé aux vendeurs ou admins.'
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['SELLER', 'ADMIN']