// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCxnSwf35W6ic-9G5katcQt9n05MPC5CIY',
  authDomain: 'typescript-image.firebaseapp.com',
  projectId: 'typescript-image',
  storageBucket: 'typescript-image.appspot.com',
  messagingSenderId: '209422635054',
  appId: '1:209422635054:web:ae2ed9afac98f409a44fbf',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
