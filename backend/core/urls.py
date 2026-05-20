from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import FileResponse, Http404
import os

DIST_DIR = os.path.join(settings.BASE_DIR, '..', 'frontend', 'dist')


def react_app(request, path=''):
    """Serve React's index.html for all non-API, non-asset routes"""
    index = os.path.join(DIST_DIR, 'index.html')
    try:
        return FileResponse(open(index, 'rb'), content_type='text/html')
    except FileNotFoundError:
        raise Http404('Frontend not built. Run: npm run build')


urlpatterns = [
    # Django REST API
    path('api/', include('results.urls')),

    # Media files (uploaded student photos)
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [

    # Frontend JS/CSS assets (Vite build output)
    re_path(r'^assets/(?P<path>.*)$', serve,
            {'document_root': os.path.join(DIST_DIR, 'assets')}),

    # Frontend root static files (logo, favicon, etc.)
    re_path(r'^(?P<path>alhikmalogo\.png|favicon\.svg|icons\.svg|vite\.svg)$',
            serve, {'document_root': DIST_DIR}),

    # Catch-all → React Router (must be LAST)
    re_path(r'^.*$', react_app),
]
