from django.urls import path
from . import views  # views from accounts/views.py
from .views import AttendanceMonthSummaryView
from .views import employee_stats
from .views import (
    register_employee,
    login_employee,
    user_profile,
    submit_attendance,
    attendance_report,
    save_attendance,
    list_employees,
    get_all_employees
)

urlpatterns = [
    path('register/', register_employee),
    path('login/', login_employee),
    path('profile/', user_profile, name='profile'),
    path('attendance/submit/', submit_attendance),
    path('attendance/report/', attendance_report),
    path('attendance/save/', save_attendance, name='save_attendance'),
    path('employees/', list_employees, name='list_employees'),
    path('all-employees/', get_all_employees, name='employee-list'),
    path('api/accounts/attendance/save/', save_attendance),
    path('attendance/month-summary/', AttendanceMonthSummaryView.as_view(), name='month_summary'),
    path('accounts/stats/', employee_stats),
]
