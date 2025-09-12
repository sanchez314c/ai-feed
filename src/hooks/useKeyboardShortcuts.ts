import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/app';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { toggleSidebar, toggleTheme, addNotification } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Prevent default browser shortcuts when our shortcuts are used
      if (cmdOrCtrl && !event.shiftKey && !event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'k': // Cmd/Ctrl + K - Focus search
            event.preventDefault();
            focusSearch();
            break;
            
          case 'b': // Cmd/Ctrl + B - Toggle sidebar
            event.preventDefault();
            toggleSidebar();
            break;
            
          case 'h': // Cmd/Ctrl + H - Go to dashboard
            event.preventDefault();
            navigate('/dashboard');
            break;
            
          case 'f': // Cmd/Ctrl + F - Go to search
            event.preventDefault();
            navigate('/search');
            break;
            
          case 'n': // Cmd/Ctrl + N - New collection
            event.preventDefault();
            navigate('/collections');
            addNotification({
              type: 'info',
              title: 'New Collection',
              message: 'Create a new collection to organize your content',
              duration: 3000,
            });
            break;
        }
      }

      // Cmd/Ctrl + Shift shortcuts
      if (cmdOrCtrl && event.shiftKey && !event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'd': // Cmd/Ctrl + Shift + D - Toggle theme
            event.preventDefault();
            toggleTheme();
            break;
            
          case 'r': // Cmd/Ctrl + Shift + R - Refresh data
            event.preventDefault();
            addNotification({
              type: 'info',
              title: 'Refreshing',
              message: 'Fetching latest content...',
              duration: 3000,
            });
            break;
        }
      }

      // Global shortcuts (no modifiers)
      if (!cmdOrCtrl && !event.shiftKey && !event.altKey) {
        // Check if user is typing in an input field
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || 
                        activeElement?.tagName === 'TEXTAREA' || 
                        activeElement?.getAttribute('contenteditable') === 'true';

        if (!isTyping) {
          switch (event.key.toLowerCase()) {
            case '/': // / - Focus search
              event.preventDefault();
              focusSearch();
              break;
              
            case '?': // ? - Show shortcuts help
              event.preventDefault();
              showShortcutsHelp();
              break;
          }
        }
      }

      // Number key shortcuts for navigation
      if (!cmdOrCtrl && !event.shiftKey && !event.altKey) {
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || 
                        activeElement?.tagName === 'TEXTAREA' || 
                        activeElement?.getAttribute('contenteditable') === 'true';

        if (!isTyping && event.key >= '1' && event.key <= '9') {
          const shortcuts = [
            '/dashboard',    // 1
            '/search',       // 2
            '/collections',  // 3
            '/analytics',    // 4
            '/settings',     // 5
          ];
          
          const index = parseInt(event.key) - 1;
          if (shortcuts[index]) {
            event.preventDefault();
            navigate(shortcuts[index]);
          }
        }
      }
    };

    const focusSearch = () => {
      // Focus the search input in the top bar
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      } else {
        // If no search input visible, navigate to search page
        navigate('/search');
      }
    };

    const showShortcutsHelp = () => {
      addNotification({
        type: 'info',
        title: 'Keyboard Shortcuts',
        message: 'Press Cmd/Ctrl+K to search, Cmd/Ctrl+B to toggle sidebar, / to focus search',
        duration: 8000,
      });
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, toggleSidebar, toggleTheme, addNotification]);
};