// pages/recipe.js

"use client"
import { Box, Typography, CardContent, Card, Stack, Divider, IconButton, Toolbar, AppBar } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { db } from '@/firebase';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MainAppBar from '../appBar';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function Home() {
  const [userId, setUserId] = useState(null)

  const [recipes, setRecipes] = useState([])

  const updateRecipes = async () => {
    const recipes = []
    const querySnapshot = await getDocs(collection(db, `users/${userId}/recipes`))

    querySnapshot.forEach((doc) => {
      recipes.push(doc.data())
    });

    console.log(recipes)
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

  useEffect(() => {
    const currUserId = localStorage.getItem('userId')
    console.log("Retrieved userId from localStorage:", currUserId);
    if (currUserId) {
      setUserId(currUserId);
    }
  }, []);
  
  useEffect(() => {
    if (userId) {
      updateRecipes();
    }
  }, [userId]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
        <MainAppBar />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Recipes
          </Typography>
          <RecipeStack recipes={recipes} />
        </Box>
    </ThemeProvider>
  );
}
