import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Button, IconButton, Toolbar, AppBar, Drawer, List, ListItem,
    ListItemButton, ListItemText, Avatar, Menu, MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import useAuthService from './authService';

export default function MainAppBar() {
    const router = useRouter()
    const { signOutOfGoogle } = useAuthService()
    const pfpURL = localStorage.getItem('pfpURL')

    const [drawerOpen, setDrawerOpen] = useState(false)

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    /*
      DROPDOWN STUFF
    */
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                {['Pantry', 'Recipes'].map((text) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton
                            onClick={() => {
                                if (text == 'Pantry') {
                                    router.push('/pantry')
                                } else {
                                    router.push('/recipes')
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

    return (
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

                <div>
                    <Button
                        onClick={handleClick}
                    >
                        <Avatar sx={{
                            border: '2px solid #1976d2',
                            borderRadius: '50%'
                        }} alt="Remy Sharp" src={pfpURL} />
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem
                            onClick={signOutOfGoogle}
                        >
                            Sign Out
                        </MenuItem>
                    </Menu>
                </div>
            </Toolbar>
        </AppBar>
    )
}