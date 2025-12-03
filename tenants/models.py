from django.db import models
from django_tenants.models import TenantMixin, DomainMixin

class Company(TenantMixin):
    name = models.CharField(max_length=100)
    created_on = models.DateField(auto_now_add=True)

    # auto_create_schema se asegura de que PostgreSQL cree un nuevo esquema 
    # cada vez que se crea una nueva Compañía.
    auto_create_schema = True

    def __str__(self):
        return self.name

class Domain(DomainMixin):
    def __str__(self):
        return self.domain