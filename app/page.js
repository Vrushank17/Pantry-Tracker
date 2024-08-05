// pages/home.js

"use client"
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function Home() {
  const router = useRouter();

  const navigateToPantry = () => {
    router.push('/pantry');
  };

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
          onClick={navigateToPantry} 
          variant='contained'
        >
          Get Started
        </Button>
      </Box>
    </ThemeProvider>
  );
}
