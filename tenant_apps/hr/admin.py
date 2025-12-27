from django.contrib import admin
from .models import Employee

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'position', 'hire_date', 'user')
    search_fields = ('first_name', 'last_name', 'email') # Añade una barra de búsqueda
    list_filter = ('position', 'hire_date') # Añade filtros laterales