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

const ExploreContainer = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', fName: '', lName: '' });

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
      await addDoc(collection(db, 'users'), newUser);
      setNewUser({ fName: '', lName: '', email: '' });
      console.log(setNewUser);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // const updateUser = async (userId, updatedData) => {
  //   try {
  //     const userRef = collection(db, 'users', userId);
  //     await updateDoc(userRef, updatedData);
  //   } catch (error) {
  //     console.error('Error updating user:', error);
  //   }
  // };

  const deleteUser = async (userId) => {
    try {
      const userRef = doc(collection(db, 'users'), userId);
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
      <IonContent className="ion-padding">
        <IonList>
          <IonLabel>
            <h1>Add User</h1>
            <IonInput
              placeholder="First Name"
              value={newUser.fName}
              onInput={(e) => setNewUser({ ...newUser, fName: e.target.value })}
            />
            <IonInput
              placeholder="Last Name"
              value={newUser.lName}
              onInput={(e) => setNewUser({ ...newUser, lName: e.target.value })}
            />
            <IonInput
              placeholder="Email"
              value={newUser.email}
              onInput={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </IonLabel>
          <IonButton expand="full" onClick={addUser}>
            Add User
          </IonButton>
        </IonList>
        <IonList>
          {users.map((user) => (
            <IonItem key={user.id}>
              <IonLabel>
                <h2>
                  {user.fName} {user.lName}
                </h2>
                <p>{user.email}</p>
              </IonLabel>
              {/* <IonButton color='warning' onClick={() => updateUser(user.id, { fName: 'Updated' })}>
                Update
              </IonButton> */}
              <IonButton color='danger' onClick={() => deleteUser(user.id)}>Delete</IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ExploreContainer;
