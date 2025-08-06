from rest_framework import serializers
from django.contrib.auth.models import User
from .models import EmployeeProfile

class RegisterSerializer(serializers.ModelSerializer):
    position = serializers.CharField(write_only=True)
    employee_id = serializers.CharField(write_only=True)
    image = serializers.ImageField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'position', 'employee_id', 'image']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        position = validated_data.pop('position')
        employee_id = validated_data.pop('employee_id')
        image = validated_data.pop('image')

        user = User.objects.create_user(**validated_data)
        EmployeeProfile.objects.create(
            user=user,
            position=position,
            employee_id=employee_id,
            image=image
        )
        return user

from rest_framework import serializers
from .models import Attendance
from .models import EmployeeSalary

class AttendanceSerializer(serializers.ModelSerializer):
    employee_id = serializers.PrimaryKeyRelatedField(
        source='employee', queryset=User.objects.all(), write_only=True
    )
    name = serializers.SerializerMethodField(read_only=True)
    position = serializers.CharField(required=False, allow_blank=True)
    punch_in = serializers.DateTimeField(required=False, allow_null=True)
    punch_out = serializers.DateTimeField(required=False, allow_null=True)
    break_start = serializers.DateTimeField(required=False, allow_null=True)
    break_end = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Attendance
        fields = [
            'employee_id',
            'employee',  # hidden but used internally
            'date',
            'punch_in',
            'punch_out',
            'break_start',
            'break_end',
            'status',
            'reason',
            'permission_type',
            'position',
            'name',
        ]
        extra_kwargs = {
            'employee': {'read_only': True}
        }

    def get_name(self, obj):
        return obj.employee.username

    

class EmployeeProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = EmployeeProfile
        fields = ['id', 'name']

    def get_name(self, obj):
        return obj.user.username

