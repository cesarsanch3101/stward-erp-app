import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Container, Grid, Paper, Alert,
  MenuItem, Select, InputLabel, FormControl, CircularProgress
} from '@mui/material';
import { createProduct, getCategories, getUnitsOfMeasure } from '../api/inventoryService';
import { useNavigate } from 'react-router-dom';

const ProductFormPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', unit_of_measure: '', sku: '',
  });
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [error, setError] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true); 
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingOptions(true);
        // LLAMADAS CORREGIDAS: Sin token
        const [catData, unitData] = await Promise.all([
          getCategories(),
          getUnitsOfMeasure()
        ]);
        setCategories(catData || []);
        setUnits(unitData || []);
      } catch (err) {
        setError('Error cargando opciones.');
        console.error(err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (event) => {
  event.preventDefault();
  setError(null);
  setFormLoading(true);

  const productData = {
    ...formData,
    category: formData.category || null,
    unit_of_measure: formData.unit_of_measure || null,
  };

  try {
    // LLAMADA CORREGIDA: Sin token
    await createProduct(productData);
    console.log('Product created successfully');
    navigate('/products');
  } catch (err) {
    console.error('Failed to create product:', err);
    const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    setError(`Error al guardar: ${errorDetail}`);
  } finally {
    setFormLoading(false);
  }
};

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>Añadir Nuevo Producto</Typography>
        {loadingOptions ? (
           <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField name="name" required fullWidth label="Nombre del Producto" autoFocus value={formData.name} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField name="description" fullWidth multiline rows={3} label="Descripción" value={formData.description} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Categoría</InputLabel>
                  <Select name="category" value={formData.category} label="Categoría" onChange={handleChange} >
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unidad de Medida</InputLabel>
                  <Select name="unit_of_measure" value={formData.unit_of_measure} label="Unidad de Medida" onChange={handleChange} >
                    <MenuItem value=""><em>Seleccione...</em></MenuItem>
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField name="sku" fullWidth label="SKU (Código)" value={formData.sku} onChange={handleChange} />
              </Grid>
            </Grid>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={formLoading}>
              {formLoading ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProductFormPage;