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
import * as api from './utils/api';
import { validateItemName } from './utils/validation';
import { formatErrorMessage, logError } from './utils/errorHandler';
import './App.css';

/**
 * Check if a due date has passed the current time
 */
function isOverdue(dueDate) {
  if (!dueDate) return false;
  return dayjs(dueDate).isBefore(dayjs());
}

/**
 * Check if a due date is within the next 24 hours but not yet overdue
 */
function isOverdueWithin24Hours(dueDate) {
  if (!dueDate) return false;
  const due = dayjs(dueDate);
  const now = dayjs();
  return due.isAfter(now) && due.diff(now, 'hours') <= 24;
}

/**
 * Format a date string into a user-friendly display format
 */
function formatDate(dateString) {
  if (!dateString) return null;
  return dayjs(dateString).format('MMM D, YYYY h:mm A');
}

function App() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [itemNameInput, setItemNameInput] = useState('');
  const [itemDueDateInput, setItemDueDateInput] = useState(null);
  const [itemNameErrorMessage, setItemNameErrorMessage] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const fetchedItems = await api.fetchItems();
      setItems(fetchedItems);
      setErrorMessage(null);
    } catch (err) {
      const message = formatErrorMessage('fetch', err);
      setErrorMessage(message);
      logError('Loading items', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItemSubmit = async (event) => {
    event.preventDefault();

    const validation = validateItemName(itemNameInput);
    if (!validation.isValid) {
      setItemNameErrorMessage(validation.error);
      return;
    }

    try {
      const dueDateFormatted = itemDueDateInput ? itemDueDateInput.toISOString() : null;
      const newItem = await api.createItem(itemNameInput, dueDateFormatted);
      setItems([newItem, ...items]);
      setItemNameInput('');
      setItemDueDateInput(null);
      setErrorMessage(null);
    } catch (err) {
      const message = formatErrorMessage('add', err);
      setErrorMessage(message);
      logError('Adding item', err);
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    try {
      await api.deleteItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
      setErrorMessage(null);
    } catch (err) {
      const message = formatErrorMessage('delete', err);
      setErrorMessage(message);
      logError(`Deleting item: ${itemName}`, err);
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

        {errorMessage && (
          <Alert 
            severity="error" 
            onClose={() => setErrorMessage(null)}
            sx={{ mb: 3 }}
          >
            {errorMessage}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add New Item
          </Typography>
          <Box component="form" onSubmit={handleAddItemSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                name="itemName"
                label="Item Name"
                placeholder="Enter item name"
                value={itemNameInput}
                onChange={(e) => setItemNameInput(e.target.value)}
                error={Boolean(itemNameErrorMessage)}
                helperText={itemNameErrorMessage}
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Due Date (Optional)"
                  value={itemDueDateInput}
                  onChange={setItemDueDateInput}
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
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoading && !errorMessage && (
            <>
              {items.length > 0 ? (
                <List data-testid="items-list">
                  {items.map((item) => (
                    <ListItem
                      key={item.id}
                      data-testid={`item-${item.name}`}
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
                          onClick={() => handleDeleteItem(item.id, item.name)}
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