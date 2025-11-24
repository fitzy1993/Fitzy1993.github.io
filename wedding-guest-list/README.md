# Wedding Guest List Manager

A collaborative wedding guest list management app with a game-like, conversational interface.

## Features

### 🎯 Setup Phase
- Set budget targets (Floor, Middle Zone, Absolute Max)
- Define cost per guest
- Name both partners

### 📝 Stage 1: Independent Brain Dump
- Each partner adds guests independently
- Conversational UI with big buttons
- One question at a time:
  - Guest name
  - Relationship type
  - Age range
  - Optional notes

### 🔍 Stage 2: Duplicate Detection
- Automatic fuzzy matching to find potential duplicates
- Review and merge duplicate entries
- Handles common variations (nicknames, spelling)

### ⭐ Stage 3: Independent Rating
- Each partner rates all guests privately
- Three key questions per guest:
  - Should they be invited? (Yes/Maybe/No)
  - Will they attend? (Definitely/Probably/Maybe/Unlikely)
  - Who wants them there? (You/Partner/Both/Parents)

### 🎭 Stage 4: The Reveal
- View results in three buckets:
  - ✅ Both Said Yes
  - ⚠️ Need to Discuss (conflicts)
  - ❌ Both Said No
- See each other's ratings and notes

### 📊 Stage 5: Dashboard
- Budget calculator with attendance probability
- Visual charts:
  - Relationship categories
  - Age distribution
  - Who's championing each guest
  - Attendance likelihood
- Estimated costs based on expected attendance

## How to Use

1. Open `index.html` in a web browser
2. Complete the setup with both partners' names and budget info
3. Each partner independently adds their guests
4. Review and resolve any duplicate entries
5. Each partner independently rates all guests
6. View the reveal to see agreements and conflicts
7. Explore the dashboard for insights and budget planning

## Technical Details

- Built with vanilla JavaScript (no frameworks required)
- Data stored locally in browser's localStorage
- Responsive design for mobile and desktop
- Uses Chart.js for visualizations
- Fuzzy string matching for duplicate detection

## Files

- `index.html` - Main application page
- `css/styles.css` - All styling and responsive design
- `js/app.js` - Main application logic
- `js/storage.js` - Local storage management
- `js/fuzzy-match.js` - Duplicate detection algorithm

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage API
- CSS Grid and Flexbox

## Privacy

All data is stored locally in your browser. Nothing is sent to any server. Clear your browser's local storage to reset the app.
