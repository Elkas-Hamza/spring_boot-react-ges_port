import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          System De Management Des Port
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/arrets">
            Arrets
          </Button>
          <Button color="inherit" component={Link} to="/escales">
            Escales
          </Button>
          <Button color="inherit" component={Link} to="/personnel">
            personnel
          </Button>
          <Button color="inherit" component={Link} to="/soustraiteure">
            sous traiteure
          </Button>
          <Button color="inherit" component={Link} to="/operations">
            Opérations
          </Button>
          <Button color="inherit" component={Link} to="/conteneures">
            Conteneure
          </Button>
          <Button color="inherit" component={Link} to="/shifts">
            Shifts
          </Button>
          <Button color="inherit" component={Link} to="/engins">
            Equipment
          </Button>
          <Button color="inherit" component={Link} to="/equipes">
            Équipes
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
