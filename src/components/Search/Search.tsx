import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Chip,
  IconButton,
  Button,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  OpenInNew as OpenIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Web as WebIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface DatabaseContentItem {
  id: string;
  title: string;
  url: string;
  source: string;
  content_type: 'paper' | 'news' | 'blog' | 'video';
  description?: string;
  summary?: string;
  authors?: string;
  published: string;
  thumbnail?: string;
  categories: string[];
  keywords: string[];
  importance_score: number;
  bookmarked: boolean;
  is_read: boolean;
  processed_at: string;
}

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DatabaseContentItem[]>([]);
  const [allItems, setAllItems] = useState<DatabaseContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [minImportance, setMinImportance] = useState(0);

  // Available filter options
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  const loadAllItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const items = (await window.electronAPI?.data.getItems({ limit: 1000 })) || [];
      setAllItems(items);

      // Extract unique sources and types for filters
      const sources = [...new Set(items.map(item => item.source))].sort();
      const types = [...new Set(items.map(item => item.content_type))].sort();

      setAvailableSources(sources);
      setAvailableTypes(types);
    } catch (err) {
      console.error('Error loading items:', err);
      setError('Failed to load items for search');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setSearchResults(allItems);
      return;
    }

    try {
      setSearching(true);
      setError(null);

      // Use the database search API
      const results = (await window.electronAPI?.data.searchItems(query)) || [];
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching:', err);
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const applyFilters = (items: DatabaseContentItem[]): DatabaseContentItem[] => {
    return items.filter(item => {
      // Type filter
      if (typeFilter !== 'all' && item.content_type !== typeFilter) return false;

      // Source filter
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;

      // Bookmarked only
      if (bookmarkedOnly && !item.bookmarked) return false;

      // Minimum importance
      if (item.importance_score < minImportance) return false;

      return true;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(allItems);
  };

  const toggleBookmark = async (itemId: string) => {
    try {
      const item = searchResults.find(i => i.id === itemId);
      if (!item) return;

      const newBookmarked = !item.bookmarked;
      const success = await window.electronAPI?.data.updateBookmark(itemId, newBookmarked);

      if (success) {
        // Update both searchResults and allItems
        const updateItem = (items: DatabaseContentItem[]) =>
          items.map(i => (i.id === itemId ? { ...i, bookmarked: newBookmarked } : i));

        setSearchResults(updateItem);
        setAllItems(updateItem);
      }
    } catch (err) {
      console.error('Error updating bookmark:', err);
    }
  };

  const openLink = (url: string) => {
    if (window.electronAPI) {
      window.electronAPI.shell.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'paper':
        return <ArticleIcon />;
      case 'video':
        return <VideoIcon />;
      case 'news':
      case 'blog':
        return <WebIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  const getImportanceColor = (importance: number) => {
    if (importance >= 8) return 'error';
    if (importance >= 6) return 'warning';
    if (importance >= 4) return 'info';
    return 'default';
  };

  useEffect(() => {
    loadAllItems();
  }, []);

  useEffect(() => {
    if (allItems.length > 0 && !searchQuery.trim()) {
      setSearchResults(allItems);
    }
  }, [allItems]);

  // Apply filters whenever they change
  const filteredResults = applyFilters(searchResults);

  if (loading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant='h6'>Loading search index...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant='h4' gutterBottom fontWeight={600}>
          Search AI Content
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Search through {allItems.length} research papers, news articles, and more
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ px: 3, pb: 2 }}>
        <form onSubmit={handleSearch}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Search by title, description, authors, or keywords...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position='end'>
                  <IconButton onClick={handleClearSearch} edge='end'>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>
      </Box>

      {/* Filters */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Button
          variant='outlined'
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
          sx={{ mb: showFilters ? 2 : 0 }}
        >
          Filters {showFilters ? '▲' : '▼'}
        </Button>

        {showFilters && (
          <Paper sx={{ p: 2, mt: 1 }}>
            <Grid container spacing={2} alignItems='center'>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label='Type'
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value='all'>All Types</MenuItem>
                    {availableTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select
                    value={sourceFilter}
                    label='Source'
                    onChange={e => setSourceFilter(e.target.value)}
                  >
                    <MenuItem value='all'>All Sources</MenuItem>
                    {availableSources.map(source => (
                      <MenuItem key={source} value={source}>
                        {source}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  type='number'
                  label='Min Importance'
                  value={minImportance}
                  onChange={e => setMinImportance(Number(e.target.value))}
                  inputProps={{ min: 0, max: 10 }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={bookmarkedOnly}
                      onChange={e => setBookmarkedOnly(e.target.checked)}
                    />
                  }
                  label='Bookmarked Only'
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {error && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Alert severity='error'>{error}</Alert>
        </Box>
      )}

      {/* Search Results */}
      <Box sx={{ px: 3, pb: 1 }}>
        <Typography variant='h6'>
          {searching ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              Searching...
            </Box>
          ) : (
            `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''}`
          )}
        </Typography>
      </Box>

      {/* Results Grid */}
      <Box sx={{ flexGrow: 1, px: 3, pb: 3, overflow: 'auto' }}>
        <Grid container spacing={3}>
          {filteredResults.map(item => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                {/* Thumbnail */}
                {item.thumbnail && (
                  <Box
                    component='img'
                    sx={{
                      height: 160,
                      width: '100%',
                      objectFit: 'cover',
                      bgcolor: 'grey.200',
                    }}
                    src={item.thumbnail}
                    alt={item.title}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Source and Type */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                      {getSourceIcon(item.content_type)}
                    </Avatar>
                    <Typography variant='caption' color='text.secondary'>
                      {item.source}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip
                      size='small'
                      label={item.importance_score}
                      color={getImportanceColor(item.importance_score)}
                      variant='outlined'
                    />
                  </Box>

                  {/* Title */}
                  <Typography
                    variant='h6'
                    gutterBottom
                    sx={{
                      fontSize: '1rem',
                      lineHeight: 1.3,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.title}
                  </Typography>

                  {/* Authors */}
                  {item.authors && (
                    <Typography variant='caption' color='text.secondary' gutterBottom>
                      By {item.authors}
                    </Typography>
                  )}

                  {/* Description/Summary */}
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      flexGrow: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {item.summary || item.description}
                  </Typography>

                  {/* Categories */}
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                    {item.categories.slice(0, 3).map(category => (
                      <Chip
                        key={category}
                        size='small'
                        label={category}
                        variant='outlined'
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Actions */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(item.published).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box>
                      <IconButton
                        size='small'
                        onClick={() => toggleBookmark(item.id)}
                        color={item.bookmarked ? 'warning' : 'default'}
                      >
                        {item.bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                      </IconButton>

                      <IconButton size='small' onClick={() => openLink(item.url)} color='primary'>
                        <OpenIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredResults.length === 0 && !searching && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant='h6' color='text.secondary' gutterBottom>
              No results found
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Try adjusting your search query or filters
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
