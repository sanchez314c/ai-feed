import React, { useState, useRef, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Popper,
  Fade,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'suggestion' | 'keyword';
  count?: number;
}

export const SearchBar: React.FC = () => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [recentSearches] = useState<string[]>([
    'machine learning',
    'GPT',
    'neural networks',
    'computer vision',
  ]);

  const inputRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      // Mock suggestions - in real app, this would call an API
      const mockSuggestions: SearchSuggestion[] = [
        { id: '1', text: `${query} research`, type: 'suggestion', count: 145 },
        {
          id: '2',
          text: `${query} applications`,
          type: 'suggestion',
          count: 89,
        },
        { id: '3', text: `${query} tutorial`, type: 'suggestion', count: 67 },
        { id: '4', text: `${query} paper`, type: 'suggestion', count: 234 },
      ];

      setSuggestions(mockSuggestions);
    }, 300),
    []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);

    if (newValue.trim()) {
      debouncedGetSuggestions(newValue);
      setOpen(true);
    } else {
      // Show recent searches when input is empty
      const recentSuggestions: SearchSuggestion[] = recentSearches.map((search, index) => ({
        id: `recent-${index}`,
        text: search,
        type: 'recent',
      }));
      setSuggestions(recentSuggestions);
      setOpen(true);
    }
  };

  const handleFocus = () => {
    if (!value.trim() && recentSearches.length > 0) {
      const recentSuggestions: SearchSuggestion[] = recentSearches.map((search, index) => ({
        id: `recent-${index}`,
        text: search,
        type: 'recent',
      }));
      setSuggestions(recentSuggestions);
    }
    setOpen(true);
  };

  const handleBlur = (event: React.FocusEvent) => {
    // Delay hiding to allow for clicking on suggestions
    setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const handleSearch = (query: string = value) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setValue('');
      setOpen(false);

      // TODO: Add to recent searches
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleClear = () => {
    setValue('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <HistoryIcon fontSize='small' color='action' />;
      case 'suggestion':
        return <SearchIcon fontSize='small' color='action' />;
      default:
        return <SearchIcon fontSize='small' color='action' />;
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        ref={inputRef}
        fullWidth
        variant='outlined'
        placeholder='Search AI content...'
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyPress}
        size='small'
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon color='action' />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position='end'>
              <IconButton size='small' onClick={handleClear} edge='end'>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover',
            },
            '&.Mui-focused': {
              bgcolor: 'background.paper',
            },
          },
        }}
      />

      {/* Suggestions Dropdown */}
      <Popper
        open={open && suggestions.length > 0}
        anchorEl={inputRef.current}
        placement='bottom-start'
        style={{ width: inputRef.current?.offsetWidth, zIndex: 1300 }}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              sx={{
                mt: 1,
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <List dense>
                {!value.trim() && recentSearches.length > 0 && (
                  <ListItem>
                    <Typography variant='caption' color='text.secondary'>
                      Recent searches
                    </Typography>
                  </ListItem>
                )}

                {suggestions.map(suggestion => (
                  <ListItem
                    key={suggestion.id}
                    button
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                      {getSuggestionIcon(suggestion.type)}
                    </Box>

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='body2'>{suggestion.text}</Typography>
                          {suggestion.count && (
                            <Chip
                              size='small'
                              label={suggestion.count}
                              variant='outlined'
                              sx={{ height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};
