from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.common.admin_views import agroconnect_admin
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dashboard-admin/', agroconnect_admin.urls),
    path('api/v1/auth/',          include('apps.authentication.urls')),
    path('api/v1/products/',      include('apps.products.urls')),
    path('api/v1/orders/',        include('apps.orders.urls')),
    path('api/v1/wallet/',        include('apps.wallet.urls')),
    path('api/v1/loyalty/',       include('apps.loyalty.urls')),
    path('api/v1/transport/',     include('apps.transport.urls')),
    path('api/v1/market-prices/', include('apps.market_prices.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/news/',          include('apps.news.urls')),
    path('api/v1/cart/',          include('apps.cart.urls')),
    path('api/schema/',           SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',             SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)