"use client"
import { Box, Typography, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useAuthService from './authService';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function Home() {
  const { signInWithGoogle } = useAuthService()

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box 
        width="100vw"
        height="100vh"
        display={'flex'}
        flexDirection='column'
        justifyContent={'center'}
        alignItems={'center'}
        gap={3}
      >
        <Typography variant="h1">SmartPantry</Typography>
        <Typography variant="h4">An easy-to-use pantry management app!</Typography>
        <Button 
          onClick={() => {
            signInWithGoogle()
          }} 
          variant='contained'
        >
          Sign In With Google
        </Button>
      </Box>
    </ThemeProvider>
  );
}
