from rest_framework import serializers
from .models import Company, Domain

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        # Por ahora, le decimos que traduzca todos los campos del modelo.
        fields = '__all__'

class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'