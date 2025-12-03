from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        # We list the specific fields we want our API to expose.
        fields = [
            'id', 
            'first_name', 
            'last_name', 
            'email', 
            'phone_number', 
            'position', 
            'hire_date',
            'user' # The ID of the linked user account
        ]