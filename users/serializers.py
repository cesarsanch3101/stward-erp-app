from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer 
class UserSerializer(serializers.ModelSerializer):
    # Nos aseguramos de que el email sea requerido y único en el sistema.
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
        )
    # Hacemos explícito que el password solo se usará para escribir (crear),
    # nunca para mostrarse en una respuesta de la API.
    password = serializers.CharField(min_length=8, write_only=True, required=True)

    class Meta:
        model = User
        # Definimos los campos que nuestro "formulario" usará.
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        """
        Este método se ejecuta cuando se crea un nuevo usuario.
        Usamos `create_user` para asegurarnos de que la contraseña
        se encripte (hashea) correctamente.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def get_token(self, user):
        token = super().get_token(user)

        # Añadimos campos personalizados al payload del token
        token['username'] = user.username
        token['email'] = user.email

        return token
       