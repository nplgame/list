// Thay thế các giá trị này với cấu hình Firebase của bạn từ console Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCdaVwbjKTjAY8MKJeMtQJ7ckaUYd2bXpo",
  authDomain: "listgame-fade8.firebaseapp.com",
  projectId: "listgame-fade8",
  storageBucket: "listgame-fade8.firebasestorage.app",
  messagingSenderId: "227142318470",
  appId: "1:227142318470:web:f400f01d84b3d9ab395407",
  measurementId: "G-3HR3WRVQPS"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Tham chiếu tới Realtime Database
const db = firebase.database();
