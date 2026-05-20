from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentSerializer

ADMIN_USERNAME = 'alhikmawomens'
ADMIN_PASSWORD = 'alhikma@916'


def check_admin(request):
    auth = request.headers.get('Authorization', '')
    return auth == 'Bearer alhikma-admin-token-2026'


@api_view(['GET'])
def get_result(request):
    register_number = request.GET.get('register_number', '').strip().upper()
    if not register_number:
        return Response({'error': 'Register number is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        student = Student.objects.get(register_number__iexact=register_number)
        serializer = StudentSerializer(student, context={'request': request})
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username', '')
    password = request.data.get('password', '')
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return Response({'success': True, 'token': 'alhikma-admin-token-2026'})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def student_list_create(request):
    if not check_admin(request):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        search = request.GET.get('search', '')
        students = Student.objects.all()
        if search:
            students = students.filter(name__icontains=search)
        serializer = StudentSerializer(students, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = StudentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def student_detail(request, pk):
    if not check_admin(request):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        student = Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StudentSerializer(student, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = StudentSerializer(student, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
def update_student_status(request, pk):
    if not check_admin(request):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        student = Student.objects.get(pk=pk)
    except Student.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in [Student.ELIGIBLE, Student.NOT_ELIGIBLE]:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    student.status = new_status
    student.save()
    serializer = StudentSerializer(student, context={'request': request})
    return Response(serializer.data)
