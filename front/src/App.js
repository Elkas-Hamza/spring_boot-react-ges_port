import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArretList from './components/list/ArretList';
import ArretForm from './components/form/ArretForm';
import EscaleList from './components/list/EscaleList';
import EscaleForm from './components/form/EscaleForm';
import PersonnelList from './components/list/PersonnelList';
import PersonnelForm from './components/form/PersonnelForm';
import OperationList from './components/list/OperationList';
import OperationForm from './components/form/OperationForm';
import ConteneureList from './components/list/ConteneureList';
import ConteneureForm from './components/form/ConteneureForm';
import ShiftList from './components/list/ShiftList';
import ShiftForm from './components/form/ShiftForm';
import EnginList from './components/list/EnginList';
import EnginForm from './components/form/EnginForm';
import EquipeList from './components/list/EquipeList';
import EquipeForm from './components/form/EquipeForm';
import EquipeDetails from './components/detail/EquipeDetails';
import Navbar from './components/Navbar';
import { Container } from '@mui/material';
import EscaleDetail from './components/detail/EscaleDetail';
import AddArretToEscale from './components/detail/AddArret';
import SoustraiteureList from './components/list/SoustraiteureList';
import SoustraiteureForm from './components/form/SoustraiteureForm';

function App() {
  return (
    <Router>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Routes>
          {/* Arret Routes */}
          <Route path="/arrets" element={<ArretList />} />
          <Route path="/arrets/create" element={<ArretForm />} />
          <Route path="/arret/create/:escaleId" element={<AddArretToEscale />} />
          <Route path="/arrets/edit/:id" element={<AddArretToEscale />} />
          {/* Escale Routes */}
          <Route path="/escales" element={<EscaleList />} />
          <Route path="/escale/create" element={<EscaleForm />} />
          <Route path="/escale/edit/:id" element={<EscaleForm />} />
          <Route path="/escale/:id" element={<EscaleDetail />} />

          {/* Personnel Routes */}
          <Route path="/personnel" element={<PersonnelList />} />
          <Route path="/personnel/create" element={<PersonnelForm />} />
          <Route path="/personnel/edit/:matricule" element={<PersonnelForm />} />
          {/* soustraiteure Routes */}
          <Route path="/soustraiteure" element={<SoustraiteureList />} />
          <Route path="/soustraiteure/create" element={<SoustraiteureForm />} />
          <Route path="/soustraiteure/edit/:matricule" element={<SoustraiteureForm />} />
          {/* Operation Routes */}
          <Route path="/operations" element={<OperationList />} />
          <Route path="/operations/create" element={<OperationForm />} />
          <Route path="/operations/edit/:id" element={<OperationForm />} />
          
          {/* Conteneure Routes */}
          <Route path="/conteneures" element={<ConteneureList />} />
          <Route path="/conteneures/add" element={<ConteneureForm />} />
          <Route path="/conteneures/edit/:id" element={<ConteneureForm />} />
          
          {/* Shift Routes */}
          <Route path="/shifts" element={<ShiftList />} />
          <Route path="/shifts/new" element={<ShiftForm />} />
          <Route path="/shifts/edit/:id" element={<ShiftForm />} />
          
          {/* Engin Routes */}
          <Route path="/engins" element={<EnginList />} />
          <Route path="/engins/new" element={<EnginForm />} />
          <Route path="/engins/edit/:id" element={<EnginForm />} />

          {/* Equipe Routes */}
          <Route path="/equipes" element={<EquipeList />} />
          <Route path="/equipes/create" element={<EquipeForm />} />
          <Route path="/equipes/edit/:id" element={<EquipeForm />} />
          <Route path="/equipes/:id" element={<EquipeDetails />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
