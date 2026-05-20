from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('result/', views.get_result, name='get_result'),
    path('admin-login/', views.admin_login, name='admin_login'),
    path('students/', views.student_list_create, name='student_list_create'),
    path('students/<int:pk>/', views.student_detail, name='student_detail'),
    path('students/<int:pk>/status/', views.update_student_status, name='update_student_status'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
