// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCdaVwbjKTjAY8MKJeMtQJ7ckaUYd2bXpo",
  authDomain: "listgame-fade8.firebaseapp.com",
  databaseURL: "https://listgame-fade8-default-rtdb.asia-southeast1.firebasedatabase.app", // Đảm bảo đúng URL
  projectId: "listgame-fade8",
  storageBucket: "listgame-fade8.appspot.com",
  messagingSenderId: "227142318470",
  appId: "1:227142318470:web:f400f01d84b3d9ab395407",
  measurementId: "G-3HR3WRVQPS"
};

// Khởi tạo Firebase
let db;
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app(); // Sử dụng app đã được khởi tạo nếu có
  }
  
  db = firebase.database();
  console.log("Kết nối Firebase thành công");
  
  // Kiểm tra kết nối
  const connectedRef = firebase.database().ref(".info/connected");
  connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
      console.log("Đã kết nối đến Firebase Realtime Database");
    } else {
      console.log("Đã mất kết nối đến Firebase Realtime Database");
    }
  });
} catch (error) {
  console.error("Lỗi khi khởi tạo Firebase:", error);
  alert("Không thể kết nối đến hệ thống. Vui lòng tải lại trang và thử lại.");
}
