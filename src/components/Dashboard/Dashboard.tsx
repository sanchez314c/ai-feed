import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  OpenInNew as OpenIcon,
  TrendingUp as TrendingIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Web as WebIcon,
  Refresh as RefreshIcon,
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

interface DatabaseStats {
  totalItems: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  bookmarkedCount: number;
  readCount: number;
  lastUpdated: string;
}

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<DatabaseContentItem[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<string | null>(null);

  const loadData = async (filter?: any) => {
    try {
      setLoading(true);
      setError(null);

      // Load items and stats in parallel
      const [itemsData, statsData] = await Promise.all([
        window.electronAPI?.data.getItems({ limit: 50, ...filter }) || [],
        window.electronAPI?.data.getStats() || null,
      ]);

      setItems(itemsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const result = await window.electronAPI?.data.refreshData();

      if (result?.success) {
        // Reload data after refresh
        await loadData();
      } else {
        setError(result?.message || 'Failed to refresh data');
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleBookmark = async (itemId: string) => {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const newBookmarked = !item.bookmarked;
      const success = await window.electronAPI?.data.updateBookmark(itemId, newBookmarked);

      if (success) {
        setItems(prev =>
          prev.map(i => (i.id === itemId ? { ...i, bookmarked: newBookmarked } : i))
        );

        // Update stats
        if (stats) {
          setStats(prev =>
            prev
              ? {
                  ...prev,
                  bookmarkedCount: prev.bookmarkedCount + (newBookmarked ? 1 : -1),
                }
              : null
          );
        }
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

  useEffect(() => {
    // Parse the current route to determine filters
    const path = location.pathname;

    if (path.includes('/sources/')) {
      const source = path.split('/sources/')[1];
      if (source === 'arxiv') {
        setSourceFilter('arXiv');
        loadData({ source: 'arXiv' });
      } else if (source === 'news') {
        setSourceFilter(null);
        loadData({ content_type: 'news' });
      } else if (source === 'youtube' || source === 'videos') {
        setSourceFilter('YouTube');
        loadData({ content_type: 'video' });
      } else if (source === 'blogs') {
        setSourceFilter(null);
        loadData({ content_type: 'blog' });
      } else if (source === 'xcom') {
        setSourceFilter('X.com');
        loadData({ source: 'X.com' });
      } else if (source === 'github') {
        setSourceFilter('GitHub');
        loadData({ source: 'GitHub' });
      }
    } else if (path.includes('/topics/')) {
      // Handle topic filtering
      const topic = path.split('/topics/')[1];
      // TODO: Implement topic filtering
      setSourceFilter(null);
      loadData();
    } else {
      setSourceFilter(null);
      loadData();
    }
  }, [location.pathname]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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

  const filteredItems = items.filter((item, index) => {
    // First apply source filter from sidebar navigation
    if (sourceFilter) {
      if (item.source !== sourceFilter) {
        return false;
      }
    }

    // Then apply tab filter
    switch (activeTab) {
      case 0:
        return true; // All
      case 1:
        return item.content_type === 'paper';
      case 2:
        return item.content_type === 'news' || item.content_type === 'blog';
      case 3:
        return item.content_type === 'video';
      case 4:
        return item.source === 'X.com'; // X.com posts
      case 5:
        return item.bookmarked;
      default:
        return true;
    }
  });

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
        <Typography variant='h6'>Loading AI content...</Typography>
        <Typography variant='body2' color='text.secondary'>
          Collecting data from arXiv, news sources, and more
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 3 }}>
          <Alert
            severity='error'
            action={
              <Button color='inherit' size='small' onClick={loadData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant='h4' gutterBottom fontWeight={600} sx={{ mb: 0 }}>
            AI Intelligence Dashboard
          </Typography>
          <Button
            variant='outlined'
            onClick={handleRefresh}
            disabled={refreshing}
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
        <Typography variant='body1' color='text.secondary'>
          Stay updated with the latest AI research, news, and developments
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <TrendingIcon color='primary' sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant='h6'>{stats?.totalItems || 0}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Total Items
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <BookmarkIcon color='warning' sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant='h6'>{stats?.bookmarkedCount || 0}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Bookmarked
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <ArticleIcon color='success' sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant='h6'>{stats?.byType?.paper || 0}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Papers
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <WebIcon color='error' sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant='h6'>{stats?.byType?.news || 0}</Typography>
              <Typography variant='body2' color='text.secondary'>
                News
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Content Tabs */}
      <Box sx={{ px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant='scrollable'>
          <Tab label='All Content' />
          <Tab label='Papers' />
          <Tab label='News & Blogs' />
          <Tab label='Videos' />
          <Tab label='X.com' />
          <Tab label='Bookmarked' />
        </Tabs>
      </Box>

      {/* Content Grid */}
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Grid container spacing={3}>
          {filteredItems.map(item => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
                onClick={e => {
                  // Only open link if clicking on the card itself, not buttons
                  if ((e.target as HTMLElement).closest('button') === null) {
                    openLink(item.url);
                  }
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
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                    onClick={() => openLink(item.url)}
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

        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant='h6' color='text.secondary' gutterBottom>
              No content found
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {items.length === 0
                ? "Click 'Refresh' to start collecting AI content from various sources"
                : 'Try adjusting your filters or check a different tab'}
            </Typography>
            {items.length === 0 && (
              <Button
                variant='contained'
                sx={{ mt: 2 }}
                onClick={handleRefresh}
                disabled={refreshing}
                startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              >
                {refreshing ? 'Starting Collection...' : 'Start Collecting'}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};
