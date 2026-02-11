import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  ThemeProvider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import theme from './theme';
import './App.css';

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return dayjs(dueDate).isBefore(dayjs());
}

function isOverdueWithin24Hours(dueDate) {
  if (!dueDate) return false;
  const due = dayjs(dueDate);
  const now = dayjs();
  return due.isAfter(now) && due.diff(now, 'hours') <= 24;
}

function formatDate(dateString) {
  if (!dateString) return null;
  return dayjs(dateString).format('MMM D, YYYY h:mm A');
}

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [newItemDueDate, setNewItemDueDate] = useState(null);
  const [itemValidationError, setItemValidationError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateItemName = (itemName) => {
    if (!itemName.trim()) {
      setItemValidationError('Item name cannot be empty');
      return false;
    }
    setItemValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateItemName(newItem)) return;

    try {
      const payload = { name: newItem };
      if (newItemDueDate) {
        payload.due_date = newItemDueDate.toISOString();
      }

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item');
      }

      const result = await response.json();
      setData([result, ...data]);
      setNewItem('');
      setNewItemDueDate(null);
      setError(null);
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleDelete = async (itemId, itemName) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setData(data.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            To Do App
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" component="p" sx={{ mb: 3, color: '#666' }}>
          Keep track of your tasks
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Item
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                name="itemName"
                label="Item Name"
                placeholder="Enter item name"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                error={Boolean(itemValidationError)}
                helperText={itemValidationError}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Due Date (Optional)"
                  value={newItemDueDate}
                  onChange={setNewItemDueDate}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </LocalizationProvider>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Add Item
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Items from Database
          </Typography>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && !error && (
            <>
              {data.length > 0 ? (
                <List data-testid="items-list">
                  {data.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        backgroundColor: isOverdue(item.due_date)
                          ? '#ffebee'
                          : isOverdueWithin24Hours(item.due_date)
                          ? '#fff3e0'
                          : 'transparent',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{item.name}</span>
                            {isOverdue(item.due_date) && (
                              <Chip
                                label="OVERDUE"
                                color="error"
                                size="small"
                              />
                            )}
                            {isOverdueWithin24Hours(item.due_date) && !isOverdue(item.due_date) && (
                              <Chip
                                label="DUE SOON"
                                color="warning"
                                size="small"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          item.due_date && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: isOverdue(item.due_date) ? '#d32f2f' : '#1976d2',
                                fontWeight: isOverdue(item.due_date) ? 600 : 400,
                              }}
                            >
                              Due: {formatDate(item.due_date)}
                            </Typography>
                          )
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDelete(item.id, item.name)}
                          color="error"
                          data-testid={`delete-${item.name}`}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No items found. Add some!
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;