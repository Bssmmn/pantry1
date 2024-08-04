'use client';
import { useState, useEffect, useRef } from "react";
import { firestore } from '@/firebase';
import { Box, Button, Typography, Modal, Stack, TextField, Card, CardContent, CardActions, Grid } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, query, setDoc, getDocs } from 'firebase/firestore';
import { Camera } from 'react-camera-pro';
import axios from 'axios';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const camera = useRef(null);
  const [image, setImage] = useState(null);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docsnap = await getDoc(docRef);

    if (docsnap.exists()) {
      const { quantity } = docsnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docsnap = await getDoc(docRef);

    if (docsnap.exists()) {
      const { quantity } = docsnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);

  const analyzeImage = async (imageData) => {
    try {
      const response = await axios.post('/api/analyze-image', { image: imageData });
      const description = response.data.description;
      if (description) {
        addItem(description.toLowerCase());
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error analyzing image, please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const takenPhoto = camera.current.takePhoto();
      const base64Image = takenPhoto.split(',')[1];
      setImage(takenPhoto);
      await analyzeImage(base64Image);
      handleCameraClose();
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Error taking photo, please try again.');
    }
  };

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      p={4}
      sx={{
        backgroundImage: 'url(/pant.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
      }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={3}
    >
      <Typography variant="h3" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
        Welcome to Pantry!
      </Typography>

      <TextField
        variant="outlined"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        sx={{
          maxWidth: '600px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '5px',
          marginBottom: '20px',
        }}
      />

      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Item
      </Button>

      <Button variant="contained" color="secondary" onClick={handleCameraOpen}>
        Take Picture and Add Item
      </Button>

      <Grid container spacing={3} justifyContent="center" sx={{ marginTop: '20px' }}>
        {filteredInventory.map(({ name, quantity }) => (
          <Grid item key={name} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '10px' }}>
              <CardContent>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {quantity}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => addItem(name)}>
                  Add
                </Button>
                <Button size="small" color="secondary" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
            borderRadius: '10px',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={cameraOpen}
        onClose={handleCameraClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
            borderRadius: '10px',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Take Picture</Typography>
          <Camera ref={camera} aspectRatio={4 / 3} />
          <Button variant="contained" color="primary" onClick={handleTakePhoto}>
            Take Photo
          </Button>
          {image && <img src={image} alt="Taken" style={{ marginTop: '10px' }} />}
        </Box>
      </Modal>
    </Box>
  );
}
