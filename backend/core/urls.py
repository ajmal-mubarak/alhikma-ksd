from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse, Http404
import os


def react_app(request, path=''):
    """Serve React's index.html for all non-API routes (handles React Router)"""
    index = os.path.join(settings.BASE_DIR, '..', 'frontend', 'dist', 'index.html')
    try:
        return FileResponse(open(index, 'rb'), content_type='text/html')
    except FileNotFoundError:
        raise Http404('Frontend not built. Run: npm run build')


urlpatterns = [
    path('api/', include('results.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all: serve React app for any non-API route
urlpatterns += [
    path('', react_app),
    path('<path:path>', react_app),
]
