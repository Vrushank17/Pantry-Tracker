// pages/recipe.js

"use client"
import { Box, Typography, CardContent, Card, Stack, Divider, TextField, IconButton, Chip, Toolbar, AppBar, Snackbar, Alert } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeProvider, createTheme, styled, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { app } from '@/firebase';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useRouter } from 'next/navigation';

const db = getFirestore(app)

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function Home() {
    const router = useRouter();

    const [recipes, setRecipes] = useState([])
    const [drawerOpen, setDrawerOpen] = useState(false);

    const navigateToPantry = () => {
        router.push('/pantry');
    };

    const navigateToRecipes = () => {
        router.push('/recipes');
    };

    const toggleDrawer = (open) => (event) => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
      setDrawerOpen(open);
    };

    const updateRecipes = async () => {
        const recipes = []
        const querySnapshot = await getDocs(collection(db, "recipes"))
        
        querySnapshot.forEach((doc) => {
            recipes.push(doc.data())
        });

        setRecipes(recipes)
    }    

    const RecipeCard = ({ recipe }) => (
        <Card sx={{ width: '100%', mb: 2 }}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              {recipe.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Ingredients:
            </Typography>
            <List dense>
              {recipe.ingredients.map((ingredient, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${ingredient.name}: ${ingredient.quantity}`}
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Steps:
            </Typography>
            <List dense>
              {recipe.steps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemText 
                    primary={`${index + 1}. ${step}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
    );

    const RecipeStack = ({ recipes }) => {
        return (
            <Box sx={{ width: '100%', height: '500px', overflowY: 'auto' }}>
            <Stack spacing={2} divider={<Divider flexItem />}>
                {recipes.map((recipe, index) => (
                    <RecipeCard key={index} recipe={recipe} />
                ))}
            </Stack>
            </Box>
        );
    };

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
          <List>
            {['Pantry', 'Recipes'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton 
                  onClick={() => {
                    if (text == 'Pantry') {
                      navigateToPantry()
                    } else {
                      navigateToRecipes()
                    }
                  }}
                >
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      );

    useEffect(() => {
        updateRecipes()
    }, [])
      
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <AppBar position="static" sx={{ width: '100%' }}>
                <Toolbar sx={{ flexDirection: { xs: 'column', sm: 'row' }, padding: { xs: 1, sm: 2 } }}>
                <div>
                    <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                    onClick={toggleDrawer(true)}
                    >
                    <MenuIcon />
                    </IconButton>
                    <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
                        {DrawerList}
                    </Drawer>
                </div>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ flexGrow: 1, display: { xs: 'block', sm: 'block' }, marginBottom: { xs: 1, sm: 0 } }}
                >
                    Your Pantry
                </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Recipes
                </Typography>
                <RecipeStack recipes={recipes} />
            </Box>
        </ThemeProvider>
    );
}
