from django.db import models
import qrcode
from io import BytesIO
import base64
from django.db import models
from django.utils.html import mark_safe

from django.db import models
from django.contrib.auth.models import User
from django.utils.html import mark_safe
from PIL import Image

class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=20, unique=True)
    position = models.CharField(max_length=50)
    image = models.ImageField(upload_to='employee_images/', null=True, blank=True, default='employee_images/default.jpg')

    def __str__(self):
        return self.user.username

    def qr_code_tag(self):
        data = f"Company: Bluez Infomatic Solution\n\nName: {self.user.username}\nEmployee ID: {self.employee_id}\nPosition: {self.position}\nAddress: 19/A, Subbaiah layout,JK Space Kamarajar road, Uppilipalayam, post, Singanallur, Coimbatore, Tamil Nadu 641015\n"
    #     image_url = f"http://127.0.0.1:8000{self.image.url}" if self.image else "No Image"
    #     data = (
    #     f"Company: Bluez Infomatic Solution\n"
    #     f"Name: {self.user.username}\n"
    #     f"Employee ID: {self.employee_id}\n"
    #     f"Position: {self.position}"
    # )
  

        # Generate QR code
        qr = qrcode.make(data)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        img_html = f'<img src="data:image/png;base64,{img_str}" width="150" height="150" />'
        return mark_safe(img_html)

    qr_code_tag.short_description = 'QR Code'


from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, time

def default_10am():
    now = datetime.now()
    return datetime.combine(now.date(), time(10, 0))

from django.db import models
from django.contrib.auth.models import User

class Attendance(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    punch_in = models.DateTimeField(null=True, blank=True)
    punch_out = models.DateTimeField(null=True, blank=True)
    break_start = models.DateTimeField(null=True, blank=True)
    break_end = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20)
    position = models.CharField(max_length=50, blank=True, null=True)
    permission_type = models.CharField(max_length=20, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)

    class Meta:
        # Prevent multiple attendance records for the same employee on the same date
        unique_together = ('employee', 'date')
        verbose_name_plural = "Attendance Records"
        ordering = ['-date']  # newest first

    def __str__(self):
        return f"{self.employee.username} – {self.date}"









from django.db import models
from .models import EmployeeProfile

class EmployeeSalary(models.Model):
    employee = models.ForeignKey(EmployeeProfile, on_delete=models.CASCADE)
    salary_amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.CharField(max_length=20)
    paid_on = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.user.username} - {self.month} - {self.salary_amount}"
    

from django.contrib import admin
from .models import Attendance

class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'status')
    list_filter = ('date', 'status')
    search_fields = ('employee__user__username',)

admin.site.register(Attendance, AttendanceAdmin)
