# Theme Toggle Feature Guide

## Overview
Added a persistent light/dark theme toggle that works across the entire GoogleHubs platform, including the landing page, authentication pages, and the main application.

## Features Implemented

### 1. Global Theme State
- Theme preference stored in `localStorage` as `GOOGLEHUBS_THEME`
- Persists across page refreshes and login/logout
- Defaults to light mode for new visitors
- Automatically applies dark mode class to `<html>` element

### 2. Theme Toggle Buttons

#### Landing Page
- **Location:** Top-right navigation bar, between logo and Sign In button
- **Icon:** 🌙 for light mode (click to go dark), ☀️ for dark mode (click to go light)
- **Behavior:** Instantly switches theme across entire page

#### Authentication Pages (Signup/Login)
- **Location:** Top-right corner of the form section
- **Icon:** Same moon/sun icons as landing page
- **Behavior:** Theme persists when navigating between signup and login

#### Main Platform (After Login)
- **Location:** Top header bar, left of notifications
- **Icon:** Same moon/sun icons
- **Behavior:** Theme applies to entire dashboard and all modules

### 3. Synchronized Theme
- Theme setting is shared across all three sections
- Changing theme in landing page carries over to auth pages
- Theme persists when user logs in to the platform
- Theme persists when user logs out back to landing page

## Technical Implementation

### Theme State Management
```typescript
// App.tsx
const [theme, setTheme] = useState<'light' | 'dark'>(() => {
  const saved = localStorage.getItem('GOOGLEHUBS_THEME');
  return (saved as 'light' | 'dark') || 'light';
});

const toggleTheme = () => {
  setTheme(prev => prev === 'light' ? 'dark' : 'light');
};
```

### LocalStorage Key
- **Key:** `GOOGLEHUBS_THEME`
- **Values:** `'light'` or `'dark'`
- **Scope:** Entire domain

### Tailwind Dark Mode Classes
All components use Tailwind's `dark:` variant for dark mode styles:
```tsx
className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
```

## User Experience

### First Visit
1. User lands on homepage in **light mode** (default)
2. User can toggle to dark mode with moon icon
3. Theme preference is saved immediately

### Returning Visit
1. User's previous theme preference is loaded automatically
2. No flash of wrong theme (loaded before render)

### During Signup Flow
1. User on landing page (theme: dark)
2. Clicks "Start Free Trial"
3. Auth page opens in **dark mode** (preserved)
4. User completes signup
5. Dashboard opens in **dark mode** (preserved)

### After Logout
1. User logged in (theme: dark)
2. Clicks "Logout"
3. Landing page shows in **dark mode** (preserved)

## Testing Instructions

### Test 1: Landing Page Toggle
1. Open landing page in light mode
2. Click moon icon (🌙)
3. Page should instantly switch to dark mode
4. Icon should change to sun (☀️)
5. Refresh page - should stay in dark mode

### Test 2: Theme Persistence Through Auth
1. Set landing page to dark mode
2. Click "Start Free Trial"
3. Signup page should be in dark mode
4. Complete signup
5. Dashboard should open in dark mode

### Test 3: Toggle in Platform
1. Log in to dashboard
2. Click theme toggle in header
3. Entire platform should switch theme
4. Navigate between pages (Prospecting, Dashboard, etc.)
5. Theme should remain consistent

### Test 4: Logout Persistence
1. Set platform to dark mode
2. Click Logout
3. Landing page should show in dark mode
4. Theme setting preserved

## Browser Compatibility

### LocalStorage Support
- ✅ Chrome 4+
- ✅ Firefox 3.5+
- ✅ Safari 4+
- ✅ Edge (all versions)
- ✅ Opera 10.5+

### Tailwind Dark Mode
- ✅ All modern browsers supporting CSS classes
- ✅ No JavaScript required for styling (pure CSS)

## Customization

### Change Default Theme
Edit `App.tsx`:
```typescript
return (saved as 'light' | 'dark') || 'dark'; // Default to dark
```

### Change Icon Style
Edit button in `LandingPage.tsx`, `AuthPage.tsx`, or `App.tsx`:
```tsx
{theme === 'light' ?
  <MoonIcon className="w-5 h-5" /> :
  <SunIcon className="w-5 h-5" />
}
```

### Add Smooth Transition
All components already have `transition-colors duration-300` applied to backgrounds and text colors for smooth theme switching.

## Accessibility

### Keyboard Navigation
- Theme toggle buttons are fully keyboard accessible (Tab + Enter/Space)

### Screen Readers
- Buttons have descriptive `title` attributes
- "Switch to Dark Mode" or "Switch to Light Mode"

### Color Contrast
- Light mode: Dark text on light backgrounds (WCAG AAA)
- Dark mode: Light text on dark backgrounds (WCAG AAA)
- All interactive elements maintain proper contrast ratios

## Performance

### Impact
- Minimal: Single localStorage read on mount
- Single localStorage write on toggle
- No network requests
- No additional bundle size

### Optimization
- Theme loaded synchronously before first render
- No flash of unstyled content (FOUC)
- No flash of wrong theme
- Instant toggle response

## Future Enhancements

### Potential Additions
1. **System Preference Detection**
   ```typescript
   const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
   ```

2. **Auto Theme Based on Time**
   - Light mode during day (6 AM - 6 PM)
   - Dark mode during night (6 PM - 6 AM)

3. **Custom Theme Colors**
   - Allow users to customize accent colors
   - Store in user preferences (database)

4. **Theme Preview**
   - Show mini preview before applying
   - A/B test different dark mode color schemes

## Troubleshooting

### Theme Not Persisting
- Check browser localStorage is enabled
- Clear localStorage and try again: `localStorage.clear()`
- Check for console errors

### Flash of Wrong Theme
- Ensure theme is loaded in `useState` initializer
- Do not load theme in `useEffect`

### Toggle Not Working
- Check `toggleTheme` function is connected to button
- Verify button `onClick={toggleTheme}` (not `onClick={() => setTheme(...)`)
- Check for JavaScript errors in console

## Summary

The theme toggle feature provides a seamless, persistent dark mode experience across the entire GoogleHubs platform. Users can switch themes anywhere - landing page, auth pages, or within the platform - and their preference is remembered across sessions. The implementation uses modern React patterns with localStorage for persistence and Tailwind CSS for styling, ensuring excellent performance and user experience.
