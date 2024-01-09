import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from '@firebase/firestore';
import firebaseConfig from '../firebaseConfig';
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonButton, IonInput, IonHeader, IonToolbar, IonTitle } from '@ionic/react';

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Offline persistence enabled successfully');
  })
  .catch((err) => {
    console.error('Error enabling offline persistence:', err);
  });

const Home = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', fName: '', lName: '' });
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(fetchedUsers);
    });

    return () => unsubscribe();
  }, [db]);

  const addUser = async () => {
    try {
      setNewUser({ fName: '', lName: '', email: '' });

      if (!selectedUser) {
        await addDoc(collection(db, 'users'), newUser);
      } else {
        await updateDoc(doc(db, 'users', selectedUser.id), newUser);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error adding/updating user:', error);
    }
  };

  const updateUser = (userId) => {
    const selected = users.find(user => user.id === userId);

    setNewUser({
      fName: selected.fName,
      lName: selected.lName,
      email: selected.email
    });

    setSelectedUser(selected);
  };

  const deleteUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Users</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList class='ion-padding'>
        <h1>{selectedUser ? 'Edit User' : 'Insert User'}</h1>
          <IonLabel>
            <IonItem>
              <IonInput
                label='First Name:'
                value={newUser.fName}
                onInput={(e) => setNewUser({ ...newUser, fName: e.target.value })}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label='Last Name:'
                value={newUser.lName}
                onInput={(e) => setNewUser({ ...newUser, lName: e.target.value })}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label='Email:'
                value={newUser.email}
                onInput={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </IonItem>
          </IonLabel>
          <IonButton
            disabled={!newUser.fName || !newUser.lName || !newUser.email}
            expand="full"
            color={selectedUser ? 'warning' : 'success'}
            onClick={addUser}
          >
            {selectedUser ? 'Update' : 'Add'}
          </IonButton>
        </IonList>

        <IonList class="ion-padding">
          <h1>List of Users</h1>
          {users.map((user) => (
            <IonItem key={user.id}>
              <IonLabel>
                <h2>
                  {user.fName} {user.lName}
                </h2>
                <p>{user.email}</p>
              </IonLabel>
              <IonList>
                <IonButton color='warning' onClick={() => updateUser(user.id)}>
                  Update
                </IonButton>
                <IonButton color='danger' onClick={() => deleteUser(user.id)}>
                  Delete
                </IonButton>
              </IonList>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
