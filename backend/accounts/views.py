from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import EmployeeProfile
from rest_framework.decorators import api_view, permission_classes



from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token

@api_view(['POST'])
def register_employee(request):
    username = request.data.get('username')

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists. Please choose a different username."},
            status=status.HTTP_400_BAD_REQUEST
        )

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_employee(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# logging in employee profile show on dashboard.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import EmployeeProfile

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    try:
        profile = EmployeeProfile.objects.get(user=user)
        return Response({
            'username': user.username,
            'email': user.email,
            'position': profile.position,
            'employee_id': profile.employee_id,
            'image': request.build_absolute_uri(profile.image.url),
        })
    except EmployeeProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)
    
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Attendance, EmployeeProfile
from datetime import datetime

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_attendance(request):
    records = request.data.get('records', [])

    if not records:
        return Response({'error': 'No attendance records found'}, status=400)

    for record in records:
        print("Single Record:", record)

        try:
            employee_id = record.get('employee_id')
            status_val = record.get('status')
            permission_type = record.get('permission_type')
            reason = record.get('reason', '')
            position = record.get('position')
            punch_in = record.get('punch_in')
            punch_out = record.get('punch_out')
            break_start = record.get('break_start')
            break_end = record.get('break_end')
            date_str = record.get('date')

            # Parse date
            try:
                date_obj = datetime.strptime(date_str.strip(), "%Y-%m-%d").date()
            except Exception as e:
                return Response({'error': 'Invalid date format', 'details': str(e)}, status=400)

            # Get the employee User object
            employee = User.objects.get(id=employee_id)

            # Get position from EmployeeProfile if not sent from frontend
            if not position:
                try:
                    profile = EmployeeProfile.objects.get(user=employee)
                    position = profile.position
                except EmployeeProfile.DoesNotExist:
                    position = 'Unknown'

            # Save attendance
            Attendance.objects.create(
                employee=employee,
                date=date_obj,
                status=status_val,
                permission_type=permission_type,
                reason=reason,
                position=profile.position,
                punch_in=punch_in,
                punch_out=punch_out,
                break_start=break_start,
                break_end=break_end
            )

        except User.DoesNotExist:
            return Response({'error': f'User with ID {employee_id} not found.'}, status=404)
        except Exception as e:
            print("SAVE ERROR:", str(e))
            return Response({'error': 'Save failed', 'details': str(e)}, status=500)

    return Response({'message': 'Attendance submitted successfully'})




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_report(request):
    attendances = Attendance.objects.all().order_by('-date', '-time')
    serializer = AttendanceSerializer(attendances, many=True)
    return Response(serializer.data)


# views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Attendance, EmployeeProfile
from django.contrib.auth.models import User
from datetime import datetime

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_attendance(request):
    records = request.data.get('records', [])
    for record in records:
        employee_id = record.get('employee_id')
        punch_in = record.get('punch_in')
        punch_out = record.get('punch_out')
        break_start = record.get('break_start')
        break_end = record.get('break_end')
        status = record.get('status')
        permission = record.get('permission_type')
        reason = record.get('reason', '')
        position = record.get('position')

        # Always use the date from frontend if provided, else use today
        date_value = record.get('date') or str(timezone.now().date())

        Attendance.objects.update_or_create(
            employee_id=employee_id,
            date=date_value,
            defaults={
                'punch_in': punch_in,
                'punch_out': punch_out,
                'break_start': break_start,
                'break_end': break_end,
                'status': status,
                'reason': reason,
                'permission_type': permission,
                'position': position,
            }
        )

    return Response({"message": "Attendance saved or updated successfully"})


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from .models import Attendance

class AttendanceMonthSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now()
        month_start = today.replace(day=1)

        attendance_qs = Attendance.objects.filter(employee=user, date__gte=month_start, date__lte=today)

        present_days = attendance_qs.filter(status__iexact='present').count()
        absent_days = attendance_qs.filter(status__iexact='absent').count()

        return Response({
            'present_days': present_days,
            'absent_days': absent_days
        })


    
# views.py
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Attendance, EmployeeSalary
from datetime import date, datetime
from django.contrib import messages

@login_required
def mark_attendance(request):
    today = date.today()
    if request.method == 'POST':
        status = request.POST.get('status')
        reason = request.POST.get('reason', '')
        Attendance.objects.update_or_create(
            employee=request.user,
            date=today,
            defaults={'status': status, 'reason': reason}
        )
        messages.success(request, "Attendance marked successfully.")
        return redirect('attendance_success')
    return render(request, 'ListTeam.jsx')

from calendar import monthrange

def calculate_salary(employee, month, year, monthly_salary=10000):
    total_days = monthrange(year, month)[1]
    present_days = Attendance.objects.filter(
        employee=employee,
        date__month=month,
        date__year=year,
        status='present'
    ).count()

    per_day_salary = monthly_salary / total_days
    total_salary = round(per_day_salary * present_days, 2)

    EmployeeSalary.objects.update_or_create(
        employee=employee,
        month=month,
        year=year,
        defaults={
            'total_present_days': present_days,
            'calculated_salary': total_salary
        }
    )


from .serializers import EmployeeProfileSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_employees(request):
    employees = User.objects.all().values('id', 'username', 'first_name', 'last_name', 'email')
    return Response(list(employees))

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import EmployeeProfile
from .serializers import EmployeeProfileSerializer

@api_view(['GET'])
def get_all_employees(request):
    employees = EmployeeProfile.objects.all()
    serializer = EmployeeProfileSerializer(employees, many=True)
    return Response(serializer.data)


from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def employee_stats(request):
    total_employees = User.objects.count()
    recent_days = 7
    recent_cutoff = timezone.now() - timedelta(days=recent_days)
    recent_employees = User.objects.filter(date_joined__gte=recent_cutoff).count()

    return Response({
        "total_employees": total_employees,
        "recent_employees": recent_employees
    })




