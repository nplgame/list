// References to HTML elements
const gamesContainer = document.getElementById('games-container');
const gameCardTemplate = document.getElementById('game-card-template');
const genreFilter = document.getElementById('genre-filter');
const minPriceFilter = document.getElementById('min-price');
const maxPriceFilter = document.getElementById('max-price');
const discountFilter = document.getElementById('discount-filter');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const gameCountElem = document.getElementById('game-count');
const loadingElem = document.getElementById('loading');
const noResultsElem = document.getElementById('no-results');

// Store all games for filtering
let allGames = [];
let genres = new Set();

// Format price to VND
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

// Calculate discount percentage
function calculateDiscountPercentage(originalPrice, discountPrice) {
  if (!discountPrice || originalPrice === discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

// Hiển thị thông báo lỗi
function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg fixed bottom-4 right-4';
  errorElement.textContent = message;
  document.body.appendChild(errorElement);
  
  setTimeout(() => {
    errorElement.remove();
  }, 5000);
}

// Render a single game card
function renderGameCard(game) {
  const gameCard = gameCardTemplate.content.cloneNode(true);
  
  // Set image
  const imageElement = gameCard.querySelector('.game-image');
  imageElement.src = game.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
  imageElement.alt = game.name;
  
  // Xử lý lỗi ảnh
  imageElement.onerror = function() {
    this.src = 'https://via.placeholder.com/300x200?text=No+Image';
  };
  
  // Set game details
  gameCard.querySelector('.game-name').textContent = game.name;
  gameCard.querySelector('.game-genre').textContent = game.genre;
  
  // Handle price and discounts
  const discountPercentage = calculateDiscountPercentage(game.price, game.discountPrice);
  
  if (discountPercentage > 0) {
    // Show original price with strikethrough
    const originalPriceElem = gameCard.querySelector('.game-original-price');
    originalPriceElem.textContent = formatPrice(game.price);
    originalPriceElem.classList.remove('hidden');
    
    // Show discount price
    gameCard.querySelector('.game-price').textContent = formatPrice(game.discountPrice);
    
    // Show discount badge
    const discountElem = gameCard.querySelector('.game-discount');
    discountElem.querySelector('.discount-percent').textContent = discountPercentage;
    discountElem.classList.remove('hidden');
  } else {
    // Show only regular price
    gameCard.querySelector('.game-price').textContent = formatPrice(game.price);
  }
  
  return gameCard;
}

// Render all games
function renderGames(games) {
  // Clear previous content except the loading indicator
  const children = Array.from(gamesContainer.children);
  for (const child of children) {
    if (child.id !== 'loading') {
      gamesContainer.removeChild(child);
    }
  }
  
  // Update game count
  gameCountElem.textContent = games.length;
  
  // Show/hide no results message
  if (games.length === 0) {
    noResultsElem.classList.remove('hidden');
  } else {
    noResultsElem.classList.add('hidden');
  }
  
  // Sử dụng DocumentFragment để cải thiện hiệu suất
  const fragment = document.createDocumentFragment();
  
  // Render each game
  games.forEach(game => {
    fragment.appendChild(renderGameCard(game));
  });
  
  // Thêm tất cả game cards vào container
  gamesContainer.appendChild(fragment);
  
  // Hide loading indicator
  loadingElem.classList.add('hidden');
}

// Populate genre filter based on available game genres
function populateGenreFilter(genres) {
  // Clear existing options except the first one
  while (genreFilter.options.length > 1) {
    genreFilter.remove(1);
  }
  
  // Add new options
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
}

// Apply filters to games
function applyFilters() {
  const selectedGenre = genreFilter.value;
  const minPrice = minPriceFilter.value ? parseInt(minPriceFilter.value) : 0;
  const maxPrice = maxPriceFilter.value ? parseInt(maxPriceFilter.value) : Infinity;
  const minDiscountPercentage = discountFilter.value ? parseInt(discountFilter.value) : 0;
  
  const filteredGames = allGames.filter(game => {
    // Genre filter
    const genreMatch = !selectedGenre || game.genre === selectedGenre;
    
    // Price filter - use discounted price if available
    const currentPrice = game.discountPrice || game.price;
    const priceMatch = currentPrice >= minPrice && (maxPrice === Infinity || currentPrice <= maxPrice);
    
    // Discount filter
    const discountPercentage = calculateDiscountPercentage(game.price, game.discountPrice);
    const discountMatch = discountPercentage >= minDiscountPercentage;
    
    return genreMatch && priceMatch && discountMatch;
  });
  
  renderGames(filteredGames);
}

// Reset all filters
function resetFilters() {
  genreFilter.value = '';
  minPriceFilter.value = '';
  maxPriceFilter.value = '';
  discountFilter.value = '';
  
  renderGames(allGames);
}

// Fetch games from Firebase
function fetchGames() {
  // Show loading indicator
  loadingElem.classList.remove('hidden');
  
  // Reference to games in database
  const gamesRef = db.ref('games');
  
  gamesRef.on('value', (snapshot) => {
    allGames = [];
    genres.clear();
    
    if (snapshot.exists()) {
      const gamesData = snapshot.val() || {};
      
      // Convert object to array and collect genres
      Object.keys(gamesData).forEach(key => {
        const game = gamesData[key];
        if (game && typeof game === 'object') { // Kiểm tra dữ liệu hợp lệ
          game.id = key; // Add id field
          allGames.push(game);
          
          // Add to genres set
          if (game.genre) {
            genres.add(game.genre);
          }
        }
      });
    }
    
    // Sort games by name
    allGames.sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate UI
    populateGenreFilter(genres);
    renderGames(allGames);
  }, (error) => {
    console.error('Error fetching games:', error);
    loadingElem.classList.add('hidden');
    showError('Không thể tải dữ liệu game. Vui lòng làm mới trang và thử lại.');
  });
}

// Xử lý sự kiện Enter trong các ô input số
function handleEnterKeyInFilters() {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };
  
  minPriceFilter.addEventListener('keypress', handleKeyPress);
  maxPriceFilter.addEventListener('keypress', handleKeyPress);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Fetch games when page loads
  try {
    fetchGames();
  } catch (error) {
    console.error('Lỗi khởi tạo:', error);
    showError('Không thể kết nối đến cơ sở dữ liệu. Vui lòng làm mới trang và thử lại.');
  }
  
  // Add event listeners for filters
  applyFiltersBtn.addEventListener('click', applyFilters);
  resetFiltersBtn.addEventListener('click', resetFilters);
  
  // Xử lý sự kiện Enter trong các ô input
  handleEnterKeyInFilters();
});
