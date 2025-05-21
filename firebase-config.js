// Thay thế các giá trị này với cấu hình Firebase của bạn từ console Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Tham chiếu tới Realtime Database
const db = firebase.database();
