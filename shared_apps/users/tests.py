import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
# ¡Importamos los modelos de inquilinos!
from tenants.models import Company, Domain

@pytest.mark.django_db
def test_user_registration():
    """
    Prueba que un nuevo usuario puede registrarse exitosamente a través de la API.
    """
    # 1. PREPARACIÓN (Arrange)

    # --- Añadimos la configuración del Inquilino Público para el Test ---
    # Las pruebas se ejecutan en un dominio 'testserver', debemos crearlo.
    public_tenant = Company(schema_name='public', name='Public Test Tenant')
    public_tenant.save()
    domain = Domain()
    domain.domain = 'testserver'  # El dominio que usa el cliente de pruebas de Django
    domain.tenant = public_tenant
    domain.is_primary = True
    domain.save()
    # -------------------------------------------------------------

    # Creamos un cliente de API para hacer peticiones y preparamos los datos.
    client = APIClient()
    new_user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "A-Strong-Test-Password123"
    }

    # 2. EJECUCIÓN (Act)
    # Hacemos la petición POST a nuestro endpoint de registro.
    response = client.post("/api/v1/users/", new_user_data, format='json')

    # 3. VERIFICACIÓN (Assert)
    # Verificamos que la respuesta del servidor fue "201 Created".
    assert response.status_code == 201

    # Verificamos que el usuario realmente existe en la base de datos.
    assert User.objects.filter(username="testuser").exists()

    # Verificamos que los datos devueltos en la respuesta son correctos.
    response_data = response.json()
    assert response_data['username'] == new_user_data['username']
    assert response_data['email'] == new_user_data['email']

    # Verificamos que, por seguridad, la contraseña NO se devuelve en la respuesta.
    assert 'password' not in response_data