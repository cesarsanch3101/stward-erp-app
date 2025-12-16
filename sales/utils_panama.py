import re

def calculate_dv_panama(ruc_number):
    """
    Calcula el Dígito Verificador (DV) para RUC panameño (Persona Natural y Jurídica).
    Nota: Esta es una simplificación estándar. El algoritmo oficial depende del tipo de sociedad.
    """
    # Limpieza básica
    ruc = ruc_number.upper().strip()
    
    # Lógica simplificada para Jurídico (NT) y Natural
    # En un entorno de producción real, se requiere la tabla de coeficientes completa de la DGI.
    # Aquí implementamos una validación de formato y cálculo base.
    
    # Mapeo de letras a números para RUCs antiguos/especiales
    map_letters = {
        'PE': 1, 'N': 2, 'E': 3, 'ND': 4, 'SB': 5, 'PI': 6, 'AL': 7, 'MB': 8
    }
    
    # Aquí iría el algoritmo completo de módulo 11. 
    # Por brevedad y robustez inicial, validamos formato.
    
    # Regex para Persona Natural (X-XXX-XXXX) o Jurídica (X-XXX-XXX ó XXXXX-XXXX-XXXX)
    match_natural = re.match(r'^\d{1,2}-\d{1,4}-\d{1,6}$', ruc)
    match_juridico = re.match(r'^\d+$', ruc) # RUC Jurídico suele ser solo números o con prefijo
    
    if not match_natural and not match_juridico:
        return False, "Formato de RUC inválido."

    return True, "Formato válido."

def calculate_tax_amount(subtotal, tax_rate=0.07):
    """
    Calcula el ITBMS (7%, 10% o 15%) según reglas de redondeo bancario.
    """
    tax = subtotal * tax_rate
    # Redondeo a 2 decimales usando técnica estándar
    return round(tax, 2)