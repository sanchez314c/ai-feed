import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  Collapse,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  BookmarkBorder as BookmarkIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Folder as FolderIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Web as WebIcon,
  Code as CodeIcon,
  Twitter as TwitterIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

import { useAppStore } from '@/store/app';

interface SidebarProps {
  width: number;
  collapsedWidth: number;
  isMobile: boolean;
}

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactElement;
  path?: string;
  badge?: number;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    id: 'search',
    title: 'Search',
    icon: <SearchIcon />,
    path: '/search',
  },
  {
    id: 'collections',
    title: 'Collections',
    icon: <FolderIcon />,
    path: '/collections',
  },
  {
    id: 'sources',
    title: 'Sources',
    icon: <WebIcon />,
    children: [
      {
        id: 'arxiv',
        title: 'arXiv Papers',
        icon: <ArticleIcon />,
        path: '/sources/arxiv',
      },
      {
        id: 'news',
        title: 'News',
        icon: <ArticleIcon />,
        path: '/sources/news',
      },
      {
        id: 'videos',
        title: 'Videos',
        icon: <VideoIcon />,
        path: '/sources/videos',
      },
      {
        id: 'blogs',
        title: 'Blogs',
        icon: <WebIcon />,
        path: '/sources/blogs',
      },
      {
        id: 'github',
        title: 'GitHub',
        icon: <CodeIcon />,
        path: '/sources/github',
      },
      {
        id: 'xcom',
        title: 'X.com',
        icon: <TwitterIcon />, // Keep the Twitter icon for now
        path: '/sources/xcom',
      },
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/analytics',
  },
];

const bottomItems: NavItem[] = [
  {
    id: 'settings',
    title: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ width, collapsedWidth, isMobile }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const [expandedItems, setExpandedItems] = React.useState<string[]>(['sources']);

  const handleItemClick = (item: NavItem) => {
    if (item.path) {
      navigate(item.path);
      if (isMobile) {
        setSidebarOpen(false);
      }
    } else if (item.children) {
      toggleExpanded(item.id);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = location.pathname === item.path;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = Boolean(item.children?.length);

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              minHeight: 48,
              justifyContent: sidebarOpen ? 'initial' : 'center',
              px: 2.5,
              pl: level > 0 ? 4 : 2.5,
              bgcolor: isActive ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: sidebarOpen ? 3 : 'auto',
                justifyContent: 'center',
                color: isActive ? 'primary.main' : 'inherit',
              }}
            >
              {item.badge ? (
                <Badge badgeContent={item.badge} color='error'>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>

            {sidebarOpen && (
              <>
                <ListItemText
                  primary={item.title}
                  sx={{
                    opacity: sidebarOpen ? 1 : 0,
                    color: isActive ? 'primary.main' : 'inherit',
                  }}
                />
                {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {/* Children */}
        {hasChildren && sidebarOpen && (
          <Collapse in={isExpanded} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const drawerContent = (
    <Box
      sx={{
        overflow: 'auto',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
        }}
      >
        {sidebarOpen && (
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AIFEED
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flexGrow: 1 }}>
        <List>{navigationItems.map(item => renderNavItem(item))}</List>
      </Box>

      {/* Bottom Items */}
      <Box>
        <Divider />
        <List>{bottomItems.map(item => renderNavItem(item))}</List>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant='temporary'
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: width,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant='permanent'
      sx={{
        width: sidebarOpen ? width : collapsedWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? width : collapsedWidth,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
