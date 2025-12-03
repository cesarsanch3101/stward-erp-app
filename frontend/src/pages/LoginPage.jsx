import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Alert } from '@mui/material';
import { login } from '../api/authService';
// ¡Importamos el hook para usar nuestra cartera!
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  // Obtenemos la función para guardar los tokens desde el contexto
  const { loginAction } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(username, password);
      // ¡Aquí está la magia! Guardamos los tokens en el estado global.
      loginAction(data);
      console.log('¡Login exitoso! Tokens guardados en el contexto.');

    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      setError('Credenciales incorrectas o usuario no activo.');
    } finally {
      setLoading(false);
    }
  };

  // El JSX del return no cambia...
  return (
    <Container component="main" maxWidth="xs">
        {/* ... todo el formulario ... */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField margin="normal" required fullWidth id="username" label="Nombre de Usuario" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <TextField margin="normal" required fullWidth name="password" label="Contraseña" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </Button>
        </Box>
    </Container>
  );
};

export default LoginPage;