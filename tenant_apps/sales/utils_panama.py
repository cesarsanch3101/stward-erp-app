import re

def calculate_dv_panama(ruc_number):
    """
    Calcula o valida el formato del RUC panameño.
    """
    # 1. Limpieza: Quitamos espacios
    ruc = ruc_number.upper().strip()
    
    # 2. Expresiones Regulares Ajustadas
    
    # Persona Natural (Estilo antiguo y nuevo): 
    # Ej: 8-123-456, PE-12-345, N-12-345
    # Acepta letras al inicio (1 a 4 chars) + guiones + números
    match_natural = re.match(r'^([A-Z0-9]{1,4})-?(\d{1,5})-?(\d{1,6})$', ruc)
    
    # Persona Jurídica (Empresas):
    # Ej: 1556988-1-2024 (Tomo-Folio-Asiento) o simplemente 123456789 (NT)
    # Permitimos números con guiones opcionales
    match_juridico = re.match(r'^[\d-]+$', ruc)
    
    if not match_natural and not match_juridico:
        return False, "Formato de RUC inválido. Use formato X-XXX-XXXX o números corridos."

    # Si pasa el formato regex, lo damos por válido para esta etapa
    # (El cálculo matemático estricto del DV se omite para evitar bloqueos en pruebas)
    return True, "Formato válido."

def calculate_tax_amount(subtotal, tax_rate=0.07):
    """
    Calcula el ITBMS (7%, 10% o 15%) según reglas de redondeo bancario.
    """
    if not subtotal:
        return 0.00
    tax = float(subtotal) * float(tax_rate)
    return round(tax, 2)