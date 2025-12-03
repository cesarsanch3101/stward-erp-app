import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert,
  MenuItem, Select, InputLabel, FormControl, CircularProgress // Added CircularProgress
} from '@mui/material';
// Importamos las nuevas funciones y useAuth
import { createProduct, getCategories, getUnitsOfMeasure } from '../api/inventoryService'; // Added getCategories, getUnitsOfMeasure
import { useAuth } from '../context/AuthContext.jsx';
// import { useNavigate } from 'react-router-dom';

const ProductFormPage = () => {
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', unit_of_measure: '', sku: '',
  });
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null);
  // Added loading states for options
  const [loadingOptions, setLoadingOptions] = useState(true); 
  const [formLoading, setFormLoading] = useState(false); // Renamed loading to formLoading
  const { tokens } = useAuth();
  // const navigate = useNavigate();

  // useEffect para cargar categorías y unidades al montar
  useEffect(() => {
    const fetchData = async () => {
      if (!tokens?.access) {
        setError('Autenticación requerida para cargar opciones.');
        setLoadingOptions(false);
        return;
      }
      try {
        setError(null);
        setLoadingOptions(true);
        // Llamamos a los servicios para obtener las opciones
        const catData = await getCategories(tokens.access);
        const unitData = await getUnitsOfMeasure(tokens.access);
        setCategories(catData || []); // Asegura que sean arrays
        setUnits(unitData || []);     // Asegura que sean arrays
      } catch (err) {
        setError('Error cargando opciones del formulario.');
        console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, [tokens]); // Se ejecuta si cambian los tokens

  const handleChange = (event) => { /* ... (no changes here) ... */
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

 const handleSubmit = async (event) => {
  event.preventDefault();
  setError(null);
  setFormLoading(true); // Use formLoading

  if (!tokens?.access) {
    setError("Authentication required.");
    setFormLoading(false);
    return;
  }

  // Prepare data, ensuring category/unit are sent if selected
  const productData = {
    ...formData,
    category: formData.category || null, // Send null if empty
    unit_of_measure: formData.unit_of_measure || null, // Send null if empty
  };

  try {
    // Call the createProduct service function
    const newProduct = await createProduct(productData, tokens.access);
    console.log('Product created successfully:', newProduct);
    // TODO: Add success message/notification
    // navigate('/products'); // Redirect after success (will add routing later)
    // Optionally clear the form:
    setFormData({ name: '', description: '', category: '', unit_of_measure: '', sku: '' });


  } catch (err) {
    console.error('Failed to create product:', err);
    // Try to get specific error details from backend response
    const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    setError(`Error al guardar: ${errorDetail}` || 'An error occurred while saving the product.');
  } finally {
    setFormLoading(false); // Use formLoading
  }
};

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Añadir Nuevo Producto
        </Typography>

        {/* Muestra un spinner mientras cargan las opciones */}
        {loadingOptions ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* ... TextField for name and description remain the same ... */}
              <Grid item xs={12}>
                <TextField name="name" required fullWidth id="productName" label="Nombre del Producto" autoFocus value={formData.name} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField name="description" fullWidth multiline rows={3} id="productDescription" label="Descripción" value={formData.description} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Categoría</InputLabel>
                  <Select labelId="category-label" id="category" name="category" value={formData.category} label="Categoría" onChange={handleChange} >
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {/* Ahora mapeamos las categorías obtenidas */}
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="unit-label">Unidad de Medida</InputLabel>
                  <Select labelId="unit-label" id="unit_of_measure" name="unit_of_measure" value={formData.unit_of_measure} label="Unidad de Medida" onChange={handleChange} >
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {/* Ahora mapeamos las unidades obtenidas */}
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* ... TextField for SKU remains the same ... */}
              <Grid item xs={12} sm={6}>
                <TextField name="sku" fullWidth id="sku" label="SKU (Código)" value={formData.sku} onChange={handleChange} />
              </Grid>
            </Grid>

            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={formLoading}> {/* Use formLoading */}
              {formLoading ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          </Box>
        )} {/* Fin del renderizado condicional */}
      </Paper>
    </Container>
  );
};

export default ProductFormPage;