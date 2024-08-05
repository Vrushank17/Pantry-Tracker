// pages/inventory.js

"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { app } from '@/firebase';
import { getFirestore, query, where, collection, doc, addDoc, getDocs, getDoc, setDoc, deleteDoc, updateDoc, Timestamp } from "firebase/firestore";
import { 
  Box, Typography, Button, Modal, Stack, TextField, IconButton, Toolbar, AppBar, Snackbar, Alert,
  InputBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Drawer, List, ListItem,
  ListItemButton, ListItemText
} from '@mui/material';
import { ThemeProvider, createTheme, styled, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// API Stuff
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY);
const db = getFirestore(app)

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '500px' },
  maxWidth: '500px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3
};

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: '90%',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function Home() {
  const router = useRouter();

  const [pantryList, setPantryList] = useState([])

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);

  const [snackbarOpenAddItem, setSnackbarOpenAddItem] = useState(false);
  const [snackbarOpenAddRecipe, setSnackbarOpenAddRecipe] = useState(false);
  const [snackbarOpenEditItem, setSnackbarOpenEditItem] = useState(false);

  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [addItemName, setAddItemName] = useState("")
  const [addItemQuantity, setAddItemQuantity] = useState(1)
  const [addItemCategory, setAddItemCategory] = useState("")
  const [addItemPrice, setAddItemPrice] = useState("")
  const [addItemExpDate, setAddItemExpDate] = useState(null)

  const [editItemQuantity, setEditItemQuantity] = useState(1)
  const [editItemCategory, setEditItemCategory] = useState("")
  const [editItemPrice, setEditItemPrice] = useState("")
  const [editItemExpDate, setEditItemExpDate] = useState(null)

  const [searchItemName, setSearchItemName] = useState("")

  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [recipe, setRecipe] = useState(null)

  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setDrawerOpen(newOpen);
  };

  const handleAddItemModalOpen = () => setAddItemModalOpen(true);
  const handleAddItemModalClose = () => setAddItemModalOpen(false);

  const handleRecipeModalOpen = () => setRecipeModalOpen(true);
  const handleRecipeModalClose = () => setRecipeModalOpen(false);

  const handleSnackbarOpenAddItem = () => setSnackbarOpenAddItem(true);
  const handleSnackbarOpenAddRecipe = () => setSnackbarOpenAddRecipe(true);
  const handleSnackbarOpenEditItem = () => setSnackbarOpenEditItem(true);

  const handleSnackbarCloseAddItem = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpenAddItem(false);
  };

  const handleSnackbarCloseAddRecipe = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpenAddRecipe(false);
  };

  const handleSnackbarCloseEditItem = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpenEditItem(false);
  };

  const navigateToPantry = () => {
    router.push('/pantry');
  };

  const navigateToRecipes = () => {
    router.push('/recipes');
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) {
      return 'N/A';
    }
    const date = dayjs(timestamp.toDate());
    return date.isValid() ? date.format('MMM D, YYYY') : 'Invalid Date';
  }

  const calculateTotalPrice = (priceString, quantity) => {
    const price = parseFloat(priceString.replace(/[$,]/g, ''));
  
    if (isNaN(price)) {
      return 'N/A';
    }
  
    const totalPrice = price * quantity;

    return `$${totalPrice.toFixed(2)}`;
  };

  const updatePantry = async (searchItemName) => {
    const pantryList = []
    let querySnapshot;

    if (searchItemName == "") {
      querySnapshot = await getDocs(collection(db, "pantry"))
    } else {
      const q = query(collection(db, "pantry"), where("__name__", ">=", searchItemName), where("__name__", "<=", searchItemName + '\uf8ff'));
      querySnapshot = await getDocs(q);
    }
    
    querySnapshot.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() })
    });
    console.log(pantryList)
    setPantryList(pantryList)
  }

  const addPantryItem = async (itemName, addItemQuantity, addItemCategory, addItemPrice, addItemExpDate) => {
    console.log("Item added")

    const docRef = doc(collection(db, 'pantry'), itemName)
    const docSnap = await getDoc(docRef)

    const expTime = Timestamp.fromDate(dayjs(addItemExpDate).toDate())

    if (docSnap.exists()) {
      const quantity = docSnap.data()['quantity']
      await updateDoc(docRef, { quantity: quantity + addItemQuantity })
    } else {
      handleSnackbarOpenAddItem()
      
      if (addItemCategory == "") {
        addItemCategory = "None"
      }

      await setDoc(docRef, 
        { 
          quantity: addItemQuantity, 
          category: addItemCategory, 
          price: addItemPrice, 
          expirationDate: expTime 
        }
      )
    }

    setAddItemName('')
    setAddItemQuantity(1)
    setAddItemCategory('')
    setAddItemPrice('')
    setAddItemExpDate(null)

    updatePantry(searchItemName)
  }

  const deletePantryItem = async (itemName) => {
    console.log("Item deleted")
    const docRef = doc(collection(db, 'pantry'), itemName)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) await deleteDoc(docRef)
    console.log(pantryList)
    updatePantry(searchItemName)
  }

  const editPantryItem = async (itemName, newItemQuantity, newItemCategory, newItemPrice, newItemExpDate) => {
    console.log("Item edited")
    
    if (newItemCategory == "") {
      newItemCategory = "None"
    }

    const expTime = Timestamp.fromDate(dayjs(newItemExpDate).toDate())

    const docRef = doc(collection(db, 'pantry'), itemName)
    await updateDoc(docRef, 
      { 
        quantity: newItemQuantity, 
        category: newItemCategory,
        price: newItemPrice, 
        expirationDate: expTime 
      }
    )
    
    handleSnackbarOpenEditItem()
    updatePantry(searchItemName)
  }

  const fetchRecipe = async (pantryList) => {
    setIsRecipeLoading(true)

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const prompt = `
      Generate a recipe using some or all of these pantry items: ${JSON.stringify(pantryList)}.
      Respond with a JSON object only, no additional text. The JSON should have this structure:
      {
        "name": "Recipe Name",
        "ingredients": [
          {"name": "Ingredient 1", "quantity": "Amount"},
          {"name": "Ingredient 2", "quantity": "Amount"}
        ],
        "steps": [
          "Step 1 description",
          "Step 2 description",
          "Step 3 description"
        ]
      }
    `

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const recipe = JSON.parse(text)
    console.log(recipe)

    setIsRecipeLoading(false);
    setRecipe(recipe)
  }

  const addRecipe = async (recipeName, recipeIngredients, recipeSteps) => {
    console.log("Recipe added")

    handleSnackbarOpenAddRecipe()

    const recipeData = {
      name: recipeName || '',
      ingredients: Array.isArray(recipeIngredients) 
        ? recipeIngredients.map(ing => ({
            name: ing.name || '',
            quantity: ing.quantity || ''
          }))
        : [],
      steps: Array.isArray(recipeSteps) ? recipeSteps : []
    };

    await addDoc(collection(db, "recipes"), recipeData);
  }

  const handleAddRecipe = (recipeName, recipeIngredients, recipeSteps) => {
    addRecipe(recipeName, recipeIngredients, recipeSteps)
    console.log("Recipe added:", recipe);
    handleRecipeModalClose();
  }
  
  const handleDiscardRecipe = () => {
    setRecipe(null);
    handleRecipeModalClose();
  }

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
    updatePantry(searchItemName)
  }, [searchItemName])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '70vh',
          width: '100vw',
        }}
      >
        <Box sx={{ flexGrow: 1, maxHeight: "100px" }}>
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
        </Box>

        <Box 
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            width: '100%',
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box sx={{ py: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: 'right' }}>
              <Button 
                onClick={handleAddItemModalOpen} 
                variant='contained' 
                fullWidth
              >
                Add Item To Pantry
              </Button>
                <Modal
                  open={addItemModalOpen}
                  onClose={handleAddItemModalClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                      Add Item
                    </Typography>
                    <Stack direction={'column'} width="100%" spacing={2}>
                      <TextField 
                        required
                        id="outlined-basic" 
                        label="Item" 
                        variant="outlined" 
                        value={addItemName}
                        onChange={(e) => setAddItemName(e.target.value)}
                        p={2}
                        fullWidth
                      />
                      <TextField
                        required 
                        id="outlined-basic" 
                        label="Quantity" 
                        variant="outlined" 
                        value={addItemQuantity}
                        onChange={(e) => setAddItemQuantity(Number(e.target.value))}
                        fullWidth
                      />
                      <TextField 
                        id="outlined-basic" 
                        label="Category" 
                        variant="outlined" 
                        value={addItemCategory}
                        onChange={(e) => setAddItemCategory(e.target.value)}
                        fullWidth
                      />
                      <TextField 
                        required
                        id="outlined-basic" 
                        label="Price Per Unit" 
                        variant="outlined" 
                        value={addItemPrice}
                        onChange={(e) => setAddItemPrice(e.target.value)}
                        fullWidth
                      />
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Expiration Date"
                          value={addItemExpDate}
                          onChange={(newValue) => setAddItemExpDate(newValue)}
                          renderInput={(params) => <TextField required {...params} fullWidth />}
                          slotProps={{
                            textField: {
                              required: true,
                            },
                          }}
                        />
                      </LocalizationProvider>
                      <div>
                        <Button 
                          onClick={() => {
                            addPantryItem(addItemName, addItemQuantity, addItemCategory, addItemPrice, addItemExpDate)
                            handleAddItemModalClose()
                          }} 
                          variant='contained'
                        >
                          Confirm
                        </Button>
                      </div>
                    </Stack>
                  </Box>
              </Modal>

              <Button 
                onClick={() => {
                  setRecipe(null)
                  fetchRecipe(pantryList)
                  handleRecipeModalOpen()
                }
                } 
                variant='contained'
                fullWidth
              >
                Generate Recipe
              </Button>

              <Modal
                open={recipeModalOpen}
                onClose={handleRecipeModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  {isRecipeLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : recipe ? (
                    <>
                      <Stack sx={{ display: 'flex', flexDirection: "column", justifyContent: 'space-between', mt: 2 }}>
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
                      </Stack>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button onClick={handleDiscardRecipe} variant="outlined" color="error">
                          Discard Recipe
                        </Button>
                        <Button 
                          onClick={() => {
                            handleAddRecipe(recipe.name, recipe.ingredients, recipe.steps)
                          }} 
                          variant="contained" 
                          color="primary"
                        >
                          Add Recipe
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Typography>No recipe generated. Please try again.</Typography>
                  )}
                </Box>
              </Modal>

              <Search sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search…"
                  inputProps={{ 'aria-label': 'search' }}
                  value={searchItemName}
                  onChange={(e) => setSearchItemName(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                  sx={{ width: '100%', ml: 1 }}
                />
              </Search>
            </Box>
          <Box
            border='1px solid #333'
            borderRadius={2}
            p={{ xs: 2, sm: 3, md: 4 }}
            width="100%"
            height="500px"
            overflow='scroll'
          >
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                        <Typography variant="h5">
                            Item
                        </Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Typography variant="h5">
                            Expiration Date
                        </Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Typography variant="h5">
                            Quantity
                        </Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Typography variant="h5">
                            Category
                        </Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Typography variant="h5">
                            Price
                        </Typography>
                    </TableCell>
                    <TableCell align="right">
                        <Typography variant="h5">
                            Actions
                        </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pantryList.map((item) => (
                    <TableRow
                      key={item.name}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                        <TableCell component="th" scope="row">
                            {item.name}
                        </TableCell>
                        <TableCell align="right">
                          {formatDate(item.expirationDate)}
                        </TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.category}</TableCell>
                        <TableCell align="right">
                            {calculateTotalPrice(item.price, item.quantity)}
                        </TableCell>
                        <TableCell align="right">
                            <Box 
                                display={'flex'} 
                                flexDirection={'row'} 
                                alignItems={'right'} 
                                justifyContent={'right'} 
                                gap={1}
                                key={item.name}
                            >
                              <div>
                                <IconButton 
                                  color="primary"
                                  onClick={() => {
                                    setItemToEdit(item.name)
                                    setEditItemQuantity(item.quantity)
                                    setEditItemCategory(item.category)
                                    setEditItemPrice(item.price)
                                    setEditItemExpDate(null)
                                  }}
                                  >
                                    <EditIcon />
                                </IconButton>
                                <Modal
                                  open={itemToEdit === item.name}
                                  onClose={() => setItemToEdit(null)}
                                  aria-labelledby="modal-modal-title"
                                  aria-describedby="modal-modal-description"
                                >
                                  <Box sx={style}>
                                    <Typography id="modal-modal-title" variant="h6" component="h2">
                                      Edit {item.name}
                                    </Typography>
                                    <Stack direction={'column'} width="100%" spacing={2}>
                                      <TextField
                                        required 
                                        id="outlined-basic" 
                                        label="Quantity" 
                                        variant="outlined" 
                                        value={editItemQuantity}
                                        onChange={(e) => setEditItemQuantity(Number(e.target.value))}
                                        fullWidth
                                      />
                                      <TextField 
                                        id="outlined-basic" 
                                        label="Category" 
                                        variant="outlined" 
                                        value={editItemCategory}
                                        onChange={(e) => setEditItemCategory(e.target.value)}
                                        fullWidth
                                      />
                                      <TextField
                                        required
                                        id="outlined-basic" 
                                        label="Price Per Unit" 
                                        variant="outlined" 
                                        value={editItemPrice}
                                        onChange={(e) => setEditItemPrice(e.target.value)}
                                        fullWidth
                                      />
                                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                          required
                                          label="Expiration Date"
                                          value={editItemExpDate}
                                          onChange={(newValue) => setEditItemExpDate(newValue)}
                                          renderInput={(params) => <TextField {...params} fullWidth/>}
                                          slotProps={{
                                            textField: {
                                              required: true,
                                            },
                                          }}
                                        />
                                      </LocalizationProvider>
                                      <div>
                                        <Button 
                                          onClick={() => {
                                            editPantryItem(item.name, editItemQuantity, editItemCategory, editItemPrice, editItemExpDate)
                                            setItemToEdit(null)
                                          }} 
                                          variant='contained'
                                        >
                                          Confirm
                                        </Button>
                                      </div>
                                    </Stack>
                                  </Box>
                              </Modal>
                              </div>
                              
                              <div>
                                <IconButton 
                                color="primary"
                                onClick={() => setItemToDelete(item.name)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                                <Dialog
                                  open={itemToDelete === item.name}
                                  onClose={() => setItemToDelete(null)}
                                  aria-labelledby="alert-dialog-title"
                                  aria-describedby="alert-dialog-description"
                                >
                                <DialogTitle id="alert-dialog-title">
                                    {"Delete Item from Inventory?"}
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText id="alert-dialog-description">
                                    Are you sure you want to delete {item.name}? This action is irreversible.
                                    </DialogContentText>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setItemToDelete(null)}>Cancel</Button>
                                    <Button 
                                    onClick={() => {
                                        deletePantryItem(item.name)
                                        setItemToDelete(null)
                                    }}
                                    autoFocus
                                    >
                                    Yes
                                    </Button>
                                </DialogActions>
                                </Dialog>
                                </div>
                            </Box>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbarOpenAddItem}
        autoHideDuration={3000}
        onClose={handleSnackbarCloseAddItem}
      >
        <Alert onClose={handleSnackbarCloseAddItem} severity="success" sx={{ width: '100%' }}>
          Item added successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbarOpenEditItem}
        autoHideDuration={3000}
        onClose={handleSnackbarCloseEditItem}
      >
        <Alert onClose={handleSnackbarCloseEditItem} severity="success" sx={{ width: '100%' }}>
          Item edited successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbarOpenAddRecipe}
        autoHideDuration={3000}
        onClose={handleSnackbarCloseAddRecipe}
      >
        <Alert onClose={handleSnackbarCloseAddRecipe} severity="success" sx={{ width: '100%' }}>
          Recipe added successfully!
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
