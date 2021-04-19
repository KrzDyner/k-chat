import './App.css';
import React, { useRef, useState } from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyBmLOTNGCxvjoJcR8UGCzGuwrm6nz1q6pI",
    authDomain: "k-chat-78df4.firebaseapp.com",
    projectId: "k-chat-78df4",
    storageBucket: "k-chat-78df4.appspot.com",
    messagingSenderId: "193798282988",
    appId: "1:193798282988:web:d6b8f272784ade6a1f8fc9",
    measurementId: "G-C1267YZ5Z7"
});
}else {
  firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {

  const[user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>K-CH@T</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom/> : <SignIn />}

      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const providor = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(providor);
  }

  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const dummy = useRef();

  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(100);

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

     e.preventDefault();

     const {uid, photoURL} = auth.currentUser;

     await messageRef.add({
       text: formValue,
       createdAt: firebase.firestore.FieldValue.serverTimestamp(),
       uid,
       photoURL
     })

     setFormValue('');

     dummy.current.scrollIntoView({behaviour: 'smooth'});
  }

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>

      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
        <button type="submit">Send</button>
      </form>
    </>
  )
 
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="photoURL"/>
      <p>{text}</p>
    </div>
  )
}

export default App;
