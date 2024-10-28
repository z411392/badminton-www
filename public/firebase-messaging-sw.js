const version = "11.0.2"
importScripts(`https://www.gstatic.com/firebasejs/${version}/firebase-app-compat.js`)
importScripts(`https://www.gstatic.com/firebasejs/${version}/firebase-messaging-compat.js`)

const main = () => {
    firebase.initializeApp({
        apiKey: "AIzaSyBUmn-bTPRbZpm6-90jhcFE-MAf4gF4mns",
        authDomain: "boyholic-badminton.firebaseapp.com",
        databaseURL: "https://boyholic-badminton-default-rtdb.firebaseio.com",
        projectId: "boyholic-badminton",
        storageBucket: "storage.boyholic.com",
        messagingSenderId: "755974691888",
        appId: "1:755974691888:web:9c78710bdb10cf9ece61f5",
        measurementId: "G-BBG6DWDYK9"
    })
    if (!firebase.messaging.isSupported()) return
    console.log("firebase-messaging-sw.js] start listening")
    const messaging = firebase.messaging()
    messaging.onBackgroundMessage((payload) => console.log('[firebase-messaging-sw.js] Received background message ', payload))
}

main()