// Cấu hình Firebase - SỬA ĐỂ KHẮC PHỤC LỖI KẾT NỐI
const firebaseConfig = {
  apiKey: "AIzaSyCdaVwbjKTjAY8MKJeMtQJ7ckaUYd2bXpo",
  authDomain: "listgame-fade8.firebaseapp.com",
  databaseURL: "https://listgame-fade8-default-rtdb.firebasedatabase.app",
  projectId: "listgame-fade8",
  storageBucket: "listgame-fade8.appspot.com",
  messagingSenderId: "227142318470",
  appId: "1:227142318470:web:f400f01d84b3d9ab395407"
};

// Khởi tạo Firebase với kiểm tra lỗi
let db = null;

try {
  // Kiểm tra xem Firebase đã được khởi tạo chưa
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase đã khởi tạo thành công");
  } else {
    firebase.app(); // Nếu đã khởi tạo, sử dụng instance hiện có
    console.log("Sử dụng Firebase instance hiện có");
  }
  
  // Khởi tạo Realtime Database
  db = firebase.database();
  
  // Kiểm tra kết nối
  const connectedRef = firebase.database().ref(".info/connected");
  connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
      console.log("Đã kết nối thành công đến Firebase Realtime Database");
    } else {
      console.log("Đã mất kết nối đến Firebase Realtime Database");
    }
  });
  
} catch (error) {
  console.error("LỖI KHỞI TẠO FIREBASE:", error);
  alert("Không thể kết nối đến Firebase. Vui lòng kiểm tra console để biết thêm chi tiết.");
}

// Kiểm tra và in ra thông tin để debug
console.log("Cấu hình Firebase:", firebaseConfig);
console.log("Database instance:", db);
