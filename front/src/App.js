import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArretList from './components/list/ArretList';
import ArretForm from './components/form/ArretForm';
import EscaleList from './components/list/EscaleList';
import EscaleForm from './components/form/EscaleForm';
import PersonnelList from './components/list/PersonnelList';
import PersonnelForm from './components/form/PersonnelForm';
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
          <Route path="/arrets/edit/:id" element={<ArretForm />} />
          
          {/* Escale Routes */}
          <Route path="/escales" element={<EscaleList />} />
          <Route path="/escale/create" element={<EscaleForm />} />
          <Route path="/escale/edit/:id" element={<EscaleForm />} />
          <Route path="/escale/:id" element={<EscaleDetail />} />

          {/* Personnel Routes */}
          <Route path="/personnel" element={<PersonnelList />} />
          <Route path="/personnel/create" element={<PersonnelForm />} />
          <Route path="/personnel/edit/:id" element={<PersonnelForm />} />
          {/* soustraiteure Routes */}
          <Route path="/soustraiteure" element={<SoustraiteureList />} />
          <Route path="/soustraiteure/create" element={<SoustraiteureForm />} />
          <Route path="/soustraiteure/edit/:id" element={<SoustraiteureForm />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
