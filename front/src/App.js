import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArretList from './components/ArretList';
import ArretForm from './components/ArretForm';
import EscaleList from './components/EscaleList';
import EscaleForm from './components/EscaleForm';
import Navbar from './components/Navbar';
import { Container } from '@mui/material';

function App() {
  return (
    <Router>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Routes>
          {/* Arret Routes */}
          <Route path="/" element={<ArretList />} />
          <Route path="/create" element={<ArretForm />} />
          <Route path="/edit/:id" element={<ArretForm />} />
          
          {/* Escale Routes */}
          <Route path="/escales" element={<EscaleList />} />
          <Route path="/escale/create" element={<EscaleForm />} />
          <Route path="/escale/edit/:id" element={<EscaleForm />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
