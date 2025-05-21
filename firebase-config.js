// Thay thế các giá trị này với cấu hình Firebase của bạn từ console Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdaVwbjKTjAY8MKJeMtQJ7ckaUYd2bXpo",
  authDomain: "listgame-fade8.firebaseapp.com",
  projectId: "listgame-fade8",
  storageBucket: "listgame-fade8.firebasestorage.app",
  messagingSenderId: "227142318470",
  appId: "1:227142318470:web:f400f01d84b3d9ab395407",
  measurementId: "G-3HR3WRVQPS",
  databaseURL: "https://listgame-fade8-default-rtdb.asia-southeast1.firebasedatabase.app/" // Thêm databaseURL
};

// Khởi tạo Firebase với xử lý lỗi
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase đã được khởi tạo thành công");
} catch (error) {
  console.error("Lỗi khi khởi tạo Firebase:", error);
  
  // Hiển thị thông báo lỗi nếu cần
  if (typeof showStatusMessage === 'function') {
    showStatusMessage("Không thể kết nối đến cơ sở dữ liệu. Vui lòng làm mới trang và thử lại.", "error");
  } else {
    // Nếu chưa có hàm showStatusMessage, tạo alert
    setTimeout(() => {
      alert("Không thể kết nối đến cơ sở dữ liệu. Vui lòng làm mới trang và thử lại.");
    }, 1000);
  }
}

// Tham chiếu tới Realtime Database
const db = firebase.database();

// Kiểm tra quyền truy cập
db.ref('.info/connected').once('value')
  .then(() => {
    console.log("Kết nối Firebase Database thành công");
  })
  .catch(error => {
    console.error("Lỗi khi kết nối Firebase Database:", error);
    
    if (typeof showStatusMessage === 'function') {
      showStatusMessage("Không có quyền truy cập cơ sở dữ liệu. Vui lòng kiểm tra cấu hình Firebase Rules.", "error");
    }
  });
