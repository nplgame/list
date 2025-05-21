/**
 * Firebase Fallback - Đảm bảo kết nối Firebase
 * File này sẽ kiểm tra và thử kết nối lại Firebase nếu db là null
 */

// Kiểm tra kết nối Firebase
function checkFirebaseConnection() {
  // Nếu db chưa được khởi tạo, thử khởi tạo lại
  if (!window.db) {
    console.warn("Database chưa được khởi tạo. Đang thử khởi tạo lại...");
    
    try {
      // Cấu hình Firebase trực tiếp
      const fallbackConfig = {
        apiKey: "AIzaSyCdaVwbjKTjAY8MKJeMtQJ7ckaUYd2bXpo",
        authDomain: "listgame-fade8.firebaseapp.com",
        databaseURL: "https://listgame-fade8-default-rtdb.firebasedatabase.app",
        projectId: "listgame-fade8",
        storageBucket: "listgame-fade8.appspot.com",
        messagingSenderId: "227142318470",
        appId: "1:227142318470:web:f400f01d84b3d9ab395407"
      };
      
      // Kiểm tra xem Firebase đã được khởi tạo chưa
      if (!firebase.apps.length) {
        firebase.initializeApp(fallbackConfig);
      } else {
        firebase.app();
      }
      
      // Khởi tạo Realtime Database
      window.db = firebase.database();
      console.log("Đã khởi tạo lại Firebase thành công");
      
      return true;
    } catch (error) {
      console.error("Không thể khởi tạo lại Firebase:", error);
      return false;
    }
  }
  
  return true;
}

// Thử thêm dữ liệu test để kiểm tra kết nối
function testFirebaseConnection() {
  if (!checkFirebaseConnection()) {
    alert("Không thể kết nối đến Firebase. Vui lòng làm mới trang và thử lại.");
    return false;
  }
  
  // Thử ghi dữ liệu test
  const testRef = window.db.ref('connection_test');
  testRef.set({
    timestamp: Date.now(),
    message: "Kiểm tra kết nối"
  })
  .then(() => {
    console.log("Kiểm tra kết nối Firebase thành công");
    // Xóa dữ liệu test sau khi kiểm tra
    testRef.remove();
    return true;
  })
  .catch(error => {
    console.error("Kiểm tra kết nối Firebase thất bại:", error);
    return false;
  });
}

// Thêm vào window để có thể gọi từ console
window.checkFirebaseConnection = checkFirebaseConnection;
window.testFirebaseConnection = testFirebaseConnection;

// Kiểm tra kết nối khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  // Đợi 2 giây trước khi kiểm tra để đảm bảo firebase-config.js đã chạy
  setTimeout(() => {
    checkFirebaseConnection();
  }, 2000);
});
