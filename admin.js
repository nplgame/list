// Xác thực đăng nhập
const loginContainer = document.getElementById('login-container');
const adminContent = document.getElementById('admin-content');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const loginErrorMessage = document.getElementById('login-error');

// Thông tin đăng nhập
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'adm123';

// Kiểm tra trạng thái đăng nhập từ localStorage
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  if (isLoggedIn) {
    loginContainer.classList.add('hidden');
    adminContent.classList.remove('hidden');
  } else {
    loginContainer.classList.remove('hidden');
    adminContent.classList.add('hidden');
  }
}

// Xử lý đăng nhập
function handleLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!username || !password) {
    showLoginError('Vui lòng nhập đầy đủ tài khoản và mật khẩu');
    return;
  }
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Đăng nhập thành công
    localStorage.setItem('adminLoggedIn', 'true');
    loginContainer.classList.add('hidden');
    adminContent.classList.remove('hidden');
    loginErrorMessage.classList.add('hidden');
    
    // Làm mới dữ liệu
    fetchGames();
  } else {
    showLoginError('Tài khoản hoặc mật khẩu không đúng');
  }
}

// Hiển thị lỗi đăng nhập
function showLoginError(message) {
  loginErrorMessage.textContent = message;
  loginErrorMessage.classList.remove('hidden');
}

// Xử lý đăng xuất
function handleLogout() {
  localStorage.removeItem('adminLoggedIn');
  loginContainer.classList.remove('hidden');
  adminContent.classList.add('hidden');
  usernameInput.value = '';
  passwordInput.value = '';
}

// References to HTML elements
const bulkGamesTextarea = document.getElementById('bulk-games');
const checkDuplicatesCheckbox = document.getElementById('check-duplicates');
const addBulkGamesBtn = document.getElementById('add-bulk-games');
const discountGenreSelect = document.getElementById('discount-genre');
const discountPercentageInput = document.getElementById('discount-percentage');
const applyPercentageDiscountBtn = document.getElementById('apply-percentage-discount');
const priceRangeMinInput = document.getElementById('price-range-min');
const priceRangeMaxInput = document.getElementById('price-range-max');
const priceRangeDiscountInput = document.getElementById('price-range-discount');
const applyPriceRangeDiscountBtn = document.getElementById('apply-price-range-discount');
const removeDuplicatesBtn = document.getElementById('remove-duplicates');
const resetDiscountsBtn = document.getElementById('reset-discounts');
const gamesTableBody = document.getElementById('games-table-body');
const gameRowTemplate = document.getElementById('game-row-template');
const tableLoadingIndicator = document.getElementById('table-loading');
const tableNoGamesMessage = document.getElementById('table-no-games');
const statusMessage = document.getElementById('status-message');

// Store all games
let allGames = {};
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
  if (!discountPrice || originalPrice <= discountPrice) return 0;
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
}

// Show status message
function showStatusMessage(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.classList.remove('hidden', 'bg-green-500', 'bg-red-500', 'bg-yellow-500');
  
  if (type === 'success') {
    statusMessage.classList.add('bg-green-500');
  } else if (type === 'error') {
    statusMessage.classList.add('bg-red-500');
  } else if (type === 'warning') {
    statusMessage.classList.add('bg-yellow-500');
  }
  
  statusMessage.classList.remove('hidden');
  
  // Hide after 5 seconds
  setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 5000);
}

// Render a single game row in the table
function renderGameRow(gameId, game) {
  const row = gameRowTemplate.content.cloneNode(true);
  
  // Set image
  const imageElement = row.querySelector('img');
  imageElement.src = game.imageUrl || 'https://via.placeholder.com/40x40?text=No+Image';
  imageElement.alt = game.name;
  
  // Handle image loading errors
  imageElement.onerror = function() {
    this.src = 'https://via.placeholder.com/40x40?text=No+Image';
  };
  
  // Set game details
  row.querySelector('.game-name').textContent = game.name;
  row.querySelector('.game-genre').textContent = game.genre;
  row.querySelector('.game-price').textContent = formatPrice(game.price);
  
  // Handle discount
  const discountPercentage = calculateDiscountPercentage(game.price, game.discountPrice);
  const discountBadge = row.querySelector('.game-discount-badge');
  
  if (discountPercentage > 0) {
    discountBadge.textContent = `-${discountPercentage}%`;
    discountBadge.classList.add('bg-red-100', 'text-red-800');
    row.querySelector('.game-discount-price').textContent = formatPrice(game.discountPrice);
  } else {
    discountBadge.textContent = 'Không giảm';
    discountBadge.classList.add('bg-gray-100', 'text-gray-800');
    row.querySelector('.game-discount-price').textContent = formatPrice(game.price);
  }
  
  // Add event listeners for buttons
  const deleteBtn = row.querySelector('.delete-game');
  deleteBtn.addEventListener('click', () => deleteGame(gameId, game.name));
  
  const editDiscountBtn = row.querySelector('.edit-discount');
  editDiscountBtn.addEventListener('click', () => editGameDiscount(gameId, game));
  
  // Store game ID in the row
  const rowElement = row.querySelector('tr');
  rowElement.dataset.gameId = gameId;
  
  return row;
}

// Render all games in the table
function renderGamesTable() {
  // Clear previous content 
  while (gamesTableBody.firstChild) {
    gamesTableBody.removeChild(gamesTableBody.firstChild);
  }
  
  if (Object.keys(allGames).length === 0) {
    // Show no games message
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="6" class="px-6 py-4 text-center text-gray-500">
        Chưa có game nào. Vui lòng thêm game mới.
      </td>
    `;
    gamesTableBody.appendChild(emptyRow);
    return;
  }
  
  // Sort games by name
  const sortedGames = Object.entries(allGames).sort((a, b) => 
    a[1].name.localeCompare(b[1].name)
  );
  
  // Render each game
  sortedGames.forEach(([gameId, game]) => {
    gamesTableBody.appendChild(renderGameRow(gameId, game));
  });
}

// Populate genre filter with available genres
function populateGenreFilters() {
  // Clear existing options except the first one
  while (discountGenreSelect.options.length > 1) {
    discountGenreSelect.remove(1);
  }
  
  // Add new options
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    discountGenreSelect.appendChild(option);
  });
}

// Parse bulk games text input
function parseBulkGamesInput() {
  const text = bulkGamesTextarea.value.trim();
  if (!text) {
    showStatusMessage('Vui lòng nhập danh sách game', 'error');
    return [];
  }
  
  const lines = text.split('\n');
  const games = [];
  const errors = [];
  
  lines.forEach((line, index) => {
    if (!line.trim()) return; // Skip empty lines
    
    const parts = line.split('|');
    if (parts.length < 3) {
      errors.push(`Dòng ${index + 1}: Không đủ thông tin (cần ít nhất tên, giá và thể loại)`);
      return;
    }
    
    const name = parts[0].trim();
    const priceStr = parts[1].trim();
    const genre = parts[2].trim();
    const imageUrl = parts.length > 3 ? parts[3].trim() : '';
    
    const price = parseInt(priceStr);
    if (isNaN(price) || price <= 0) {
      errors.push(`Dòng ${index + 1}: Giá không hợp lệ (${priceStr})`);
      return;
    }
    
    games.push({
      name,
      price,
      genre,
      imageUrl,
      addedAt: Date.now()
    });
  });
  
  if (errors.length > 0) {
    showStatusMessage(`Có lỗi: ${errors[0]}${errors.length > 1 ? ` và ${errors.length - 1} lỗi khác` : ''}`, 'error');
    console.error('Parsing errors:', errors);
  }
  
  return games;
}

// Check for duplicate games
function checkDuplicates(newGames) {
  // Check for duplicates within new games
  const duplicatesMap = {};
  newGames.forEach(game => {
    const key = game.name.toLowerCase();
    if (duplicatesMap[key]) {
      duplicatesMap[key].count++;
    } else {
      duplicatesMap[key] = { count: 1, game };
    }
  });
  
  // Check for duplicates with existing games
  Object.values(allGames).forEach(existingGame => {
    const key = existingGame.name.toLowerCase();
    if (duplicatesMap[key]) {
      duplicatesMap[key].count++;
      duplicatesMap[key].existsInDatabase = true;
    }
  });
  
  // Filter out games with duplicates
  const uniqueGames = newGames.filter(game => {
    const key = game.name.toLowerCase();
    return duplicatesMap[key].count === 1 || !duplicatesMap[key].existsInDatabase;
  });
  
  // Show status message if duplicates were found
  const duplicatesCount = newGames.length - uniqueGames.length;
  if (duplicatesCount > 0) {
    showStatusMessage(`Đã loại bỏ ${duplicatesCount} game trùng lặp`, 'warning');
  }
  
  return uniqueGames;
}

// Add bulk games to database
function addBulkGames() {
  // Debug: Kiểm tra kết nối database trước
  console.log("Kiểm tra kết nối Firebase trước khi thêm game:", db);
  if (!db) {
    showStatusMessage("Không thể kết nối đến cơ sở dữ liệu!", 'error');
    return;
  }

  const games = parseBulkGamesInput();
  if (games.length === 0) {
    return;
  }
  
  let gamesToAdd = games;
  
  // Check for duplicates if enabled
  if (checkDuplicatesCheckbox.checked) {
    gamesToAdd = checkDuplicates(games);
  }
  
  if (gamesToAdd.length === 0) {
    showStatusMessage('Không có game mới để thêm sau khi loại bỏ trùng lặp', 'warning');
    return;
  }
  
  // Hiển thị thông báo đang xử lý
  showStatusMessage('Đang thêm game...', 'warning');
  
  // Thêm game từng cái một và theo dõi tiến trình
  let successCount = 0;
  let errorCount = 0;
  let totalGames = gamesToAdd.length;
  
  gamesToAdd.forEach(game => {
    try {
      // Tạo reference mới cho mỗi game
      const newGameRef = db.ref('games').push();
      
      // Lưu game vào database
      newGameRef.set(game)
        .then(() => {
          successCount++;
          console.log(`Đã thêm game "${game.name}" thành công`);
          
          // Kiểm tra nếu đã xử lý tất cả game
          if (successCount + errorCount === totalGames) {
            onAddGamesComplete(successCount, errorCount);
          }
        })
        .catch(error => {
          errorCount++;
          console.error(`Lỗi khi thêm game "${game.name}":`, error);
          
          // Kiểm tra nếu đã xử lý tất cả game
          if (successCount + errorCount === totalGames) {
            onAddGamesComplete(successCount, errorCount);
          }
        });
    } catch (error) {
      errorCount++;
      console.error(`Lỗi khi thêm game "${game.name}":`, error);
      
      // Kiểm tra nếu đã xử lý tất cả game
      if (successCount + errorCount === totalGames) {
        onAddGamesComplete(successCount, errorCount);
      }
    }
  });
}

// Xử lý khi hoàn thành thêm game
function onAddGamesComplete(successCount, errorCount) {
  if (errorCount === 0) {
    showStatusMessage(`Đã thêm ${successCount} game mới thành công`, 'success');
    bulkGamesTextarea.value = ''; // Clear textarea
  } else if (successCount === 0) {
    showStatusMessage(`Không thể thêm game. Gặp ${errorCount} lỗi.`, 'error');
  } else {
    showStatusMessage(`Đã thêm ${successCount} game thành công và ${errorCount} lỗi`, 'warning');
    bulkGamesTextarea.value = ''; // Clear textarea
  }
}

// Delete a game
function deleteGame(gameId, gameName) {
  if (!confirm(`Bạn có chắc chắn muốn xóa game "${gameName}"?`)) {
    return;
  }
  
  const gameRef = db.ref(`games/${gameId}`);
  
  gameRef.remove()
    .then(() => {
      showStatusMessage(`Đã xóa game "${gameName}" thành công`);
    })
    .catch(error => {
      console.error('Error deleting game:', error);
      showStatusMessage(`Lỗi khi xóa game: ${error.message}`, 'error');
    });
}

// Edit game discount
function editGameDiscount(gameId, game) {
  const discountPercentage = calculateDiscountPercentage(game.price, game.discountPrice);
  const currentDiscount = discountPercentage > 0 ? discountPercentage : 0;
  
  const newPercentage = prompt(`Nhập phần trăm giảm giá cho "${game.name}" (0-99):`, currentDiscount);
  
  if (newPercentage === null) return; // User cancelled
  
  const percentage = parseInt(newPercentage);
  if (isNaN(percentage) || percentage < 0 || percentage > 99) {
    showStatusMessage('Phần trăm giảm giá không hợp lệ', 'error');
    return;
  }
  
  let updatedGame = { ...game };
  
  if (percentage === 0) {
    // No discount
    if (updatedGame.discountPrice) {
      delete updatedGame.discountPrice;
    }
  } else {
    // Apply discount
    updatedGame.discountPrice = Math.round(updatedGame.price * (1 - percentage / 100));
  }
  
  // Update in database
  const gameRef = db.ref(`games/${gameId}`);
  
  gameRef.update(updatedGame)
    .then(() => {
      showStatusMessage(`Đã cập nhật giảm giá cho "${game.name}" thành công`);
    })
    .catch(error => {
      console.error('Error updating game discount:', error);
      showStatusMessage(`Lỗi khi cập nhật giảm giá: ${error.message}`, 'error');
    });
}

// Apply percentage discount to selected games
function applyPercentageDiscount() {
  const selectedGenre = discountGenreSelect.value;
  const percentageStr = discountPercentageInput.value;
  
  if (!percentageStr) {
    showStatusMessage('Vui lòng nhập phần trăm giảm giá', 'error');
    return;
  }
  
  const percentage = parseInt(percentageStr);
  if (isNaN(percentage) || percentage < 1 || percentage > 99) {
    showStatusMessage('Phần trăm giảm giá phải từ 1-99', 'error');
    return;
  }
  
  // Filter games by genre if specified
  const gamesToUpdate = Object.entries(allGames).filter(([_, game]) => 
    !selectedGenre || game.genre === selectedGenre
  );
  
  if (gamesToUpdate.length === 0) {
    showStatusMessage('Không có game nào phù hợp với điều kiện', 'warning');
    return;
  }
  
  if (!confirm(`Bạn có chắc chắn muốn giảm giá ${percentage}% cho ${gamesToUpdate.length} game?`)) {
    return;
  }
  
  // Apply discount to each game
  const updates = {};
  
  gamesToUpdate.forEach(([gameId, game]) => {
    updates[`games/${gameId}/discountPrice`] = Math.round(game.price * (1 - percentage / 100));
  });
  
  // Update all games at once
  db.ref().update(updates)
    .then(() => {
      showStatusMessage(`Đã áp dụng giảm giá ${percentage}% cho ${gamesToUpdate.length} game`);
    })
    .catch(error => {
      console.error('Error applying discount:', error);
      showStatusMessage(`Lỗi khi áp dụng giảm giá: ${error.message}`, 'error');
    });
}

// Apply price range discount
function applyPriceRangeDiscount() {
  const minPriceStr = priceRangeMinInput.value;
  const maxPriceStr = priceRangeMaxInput.value;
  const percentageStr = priceRangeDiscountInput.value;
  
  if (!minPriceStr || !maxPriceStr) {
    showStatusMessage('Vui lòng nhập khoảng giá', 'error');
    return;
  }
  
  if (!percentageStr) {
    showStatusMessage('Vui lòng nhập phần trăm giảm giá', 'error');
    return;
  }
  
  const minPrice = parseInt(minPriceStr);
  const maxPrice = parseInt(maxPriceStr);
  const percentage = parseInt(percentageStr);
  
  if (isNaN(minPrice) || minPrice < 0) {
    showStatusMessage('Giá tối thiểu không hợp lệ', 'error');
    return;
  }
  
  if (isNaN(maxPrice) || maxPrice <= minPrice) {
    showStatusMessage('Giá tối đa phải lớn hơn giá tối thiểu', 'error');
    return;
  }
  
  if (isNaN(percentage) || percentage < 1 || percentage > 99) {
    showStatusMessage('Phần trăm giảm giá phải từ 1-99', 'error');
    return;
  }
  
  // Filter games by price range
  const gamesToUpdate = Object.entries(allGames).filter(([_, game]) => 
    game.price >= minPrice && game.price <= maxPrice
  );
  
  if (gamesToUpdate.length === 0) {
    showStatusMessage('Không có game nào trong khoảng giá này', 'warning');
    return;
  }
  
  if (!confirm(`Bạn có chắc chắn muốn giảm giá ${percentage}% cho ${gamesToUpdate.length} game trong khoảng giá ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}?`)) {
    return;
  }
  
  // Apply discount to each game
  const updates = {};
  
  gamesToUpdate.forEach(([gameId, game]) => {
    updates[`games/${gameId}/discountPrice`] = Math.round(game.price * (1 - percentage / 100));
  });
  
  // Update all games at once
  db.ref().update(updates)
    .then(() => {
      showStatusMessage(`Đã áp dụng giảm giá ${percentage}% cho ${gamesToUpdate.length} game`);
    })
    .catch(error => {
      console.error('Error applying discount:', error);
      showStatusMessage(`Lỗi khi áp dụng giảm giá: ${error.message}`, 'error');
    });
}

// Remove duplicate games
function removeDuplicates() {
  // Group games by name (case insensitive)
  const gamesByName = {};
  
  Object.entries(allGames).forEach(([gameId, game]) => {
    const key = game.name.toLowerCase();
    
    if (!gamesByName[key]) {
      gamesByName[key] = [];
    }
    
    gamesByName[key].push({ id: gameId, game });
  });
  
  // Find duplicates
  const duplicatesToRemove = [];
  
  Object.values(gamesByName).forEach(games => {
    if (games.length > 1) {
      // Keep the newest one (highest addedAt timestamp)
      games.sort((a, b) => (b.game.addedAt || 0) - (a.game.addedAt || 0));
      
      // Mark all but the first one for removal
      for (let i = 1; i < games.length; i++) {
        duplicatesToRemove.push({ id: games[i].id, name: games[i].game.name });
      }
    }
  });
  
  if (duplicatesToRemove.length === 0) {
    showStatusMessage('Không tìm thấy game trùng lặp', 'warning');
    return;
  }
  
  if (!confirm(`Tìm thấy ${duplicatesToRemove.length} game trùng lặp. Bạn có chắc chắn muốn xóa?`)) {
    return;
  }
  
  // Delete duplicates
  const updates = {};
  
  duplicatesToRemove.forEach(duplicate => {
    updates[`games/${duplicate.id}`] = null;
  });
  
  // Update database
  db.ref().update(updates)
    .then(() => {
      showStatusMessage(`Đã xóa ${duplicatesToRemove.length} game trùng lặp`);
    })
    .catch(error => {
      console.error('Error removing duplicates:', error);
      showStatusMessage(`Lỗi khi xóa game trùng lặp: ${error.message}`, 'error');
    });
}

// Reset all discounts
function resetAllDiscounts() {
  if (!confirm('Bạn có chắc chắn muốn xóa tất cả giảm giá?')) {
    return;
  }
  
  const updates = {};
  
  Object.entries(allGames).forEach(([gameId, game]) => {
    if (game.discountPrice) {
      updates[`games/${gameId}/discountPrice`] = null;
    }
  });
  
  if (Object.keys(updates).length === 0) {
    showStatusMessage('Không có game nào đang được giảm giá', 'warning');
    return;
  }
  
  // Update database
  db.ref().update(updates)
    .then(() => {
      showStatusMessage(`Đã xóa giảm giá cho ${Object.keys(updates).length} game`);
    })
    .catch(error => {
      console.error('Error resetting discounts:', error);
      showStatusMessage(`Lỗi khi xóa giảm giá: ${error.message}`, 'error');
    });
}

// Fetch games from Firebase
function fetchGames() {
  // Reference to games in database
  const gamesRef = db.ref('games');
  
  // Thêm timeout để xử lý trường hợp không phản hồi
  let fetchTimeout = setTimeout(() => {
    showStatusMessage("Không thể tải dữ liệu game: Timeout. Vui lòng làm mới trang.", "error");
  }, 15000);
  
  gamesRef.on('value', (snapshot) => {
    // Hủy timeout nếu nhận được phản hồi
    clearTimeout(fetchTimeout);
    
    allGames = {};
    genres.clear();
    
    if (snapshot.exists()) {
      allGames = snapshot.val() || {};
      
      // Collect genres
      Object.values(allGames).forEach(game => {
        if (game && game.genre) {
          genres.add(game.genre);
        }
      });
    }
    
    // Populate UI
    populateGenreFilters();
    renderGamesTable();
  }, (error) => {
    // Hủy timeout nếu có lỗi
    clearTimeout(fetchTimeout);
    
    console.error('Error fetching games:', error);
    showStatusMessage(`Lỗi khi tải dữ liệu: ${error.message}`, 'error');
  });
}

// Kiểm tra quyền truy cập database
function checkDatabasePermissions() {
  // Thử ghi giá trị test vào database
  const testRef = db.ref('permissions_test');
  
  testRef.set({
      timestamp: Date.now(),
      message: "Testing write permissions"
    })
    .then(() => {
      console.log("Đã xác minh quyền ghi vào database");
      // Xóa dữ liệu test sau khi kiểm tra
      testRef.remove();
    })
    .catch(error => {
      console.error("Không có quyền ghi vào database:", error);
      showStatusMessage("Không có quyền ghi vào cơ sở dữ liệu. Vui lòng kiểm tra Firebase Rules.", "error");
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Thêm debug thông tin về DOM elements
  console.log("DOM elements:");
  console.log("loginContainer:", loginContainer);
  console.log("adminContent:", adminContent);
  console.log("addBulkGamesBtn:", addBulkGamesBtn);
  
  // Kiểm tra trạng thái đăng nhập
  checkLoginStatus();
  
  // Thêm event listeners for login/logout
  loginButton.addEventListener('click', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  
  // Xử lý nhấn Enter trong form đăng nhập
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });
  
  // Add event listeners for admin functions
  addBulkGamesBtn.addEventListener('click', () => {
    console.log("Thêm game button clicked");
    addBulkGames();
  });
  
  applyPercentageDiscountBtn.addEventListener('click', applyPercentageDiscount);
  applyPriceRangeDiscountBtn.addEventListener('click', applyPriceRangeDiscount);
  removeDuplicatesBtn.addEventListener('click', removeDuplicates);
  resetDiscountsBtn.addEventListener('click', resetAllDiscounts);
  
  // Fetch games và kiểm tra quyền khi đã đăng nhập
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    // Kiểm tra quyền truy cập database
    setTimeout(checkDatabasePermissions, 2000);
    
    // Tải danh sách game
    fetchGames();
  }
});

// Kiểm tra xem có đang chạy trên localhost không
const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('192.168.');

// Thêm debug chức năng nếu đang ở localhost
if (isLocalhost) {
  window.debugAddGame = function() {
    const testGame = {
      name: "Test Game " + Date.now(),
      price: 100000,
      genre: "Test",
      imageUrl: "https://via.placeholder.com/300x200",
      addedAt: Date.now()
    };
    
    db.ref('games').push().set(testGame)
      .then(() => {
        console.log("Đã thêm game test thành công");
        alert("Đã thêm game test thành công");
      })
      .catch(error => {
        console.error("Lỗi khi thêm game test:", error);
        alert("Lỗi khi thêm game test: " + error.message);
      });
  };
}
