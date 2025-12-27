from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# --- CORRECCIÓN CRÍTICA AQUÍ ABAJO ---
from .models import User  # Importamos NUESTRO usuario, no el de Django

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(min_length=8, write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'is_maritime_crew', 'global_id')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_maritime_crew=validated_data.get('is_maritime_crew', False)
        )
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def get_token(self, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['is_maritime'] = user.is_maritime_crew
        return token