import React, { useState, useEffect } from 'react';
import * as Realm from 'realm-web';
import { IonItem, IonLabel, IonInput, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';


const ExploreContainer = () => {
  const [products, setProducts] = useState([]);
  const [task, setTask] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const history = useHistory();


  const REALM_APP_ID = 'application-0-wlfjx';
  const app = new Realm.App({ id: REALM_APP_ID });
  const credentials = Realm.Credentials.anonymous();

  useEffect(() => {
    const localData = localStorage.getItem('products');
    if (localData) {
      setProducts(JSON.parse(localData));
    }
  }, []);

  const saveDataToLocal = (data) => {
    localStorage.setItem('products', JSON.stringify(data));
  };

  const fetchData = async () => {
    const user = app.currentUser || (await app.logIn(credentials));
    const mongodb = user.mongoClient('mongodb-atlas');
    const db = mongodb.db('todo');
    const productsCollection = db.collection('Task');
    const productsToStore = await productsCollection.find();

    setProducts(productsToStore);
    saveDataToLocal(productsToStore);
  };

  useEffect(() => {
    fetchData();
  }, [app, credentials]);

  const addProduct = async () => {
    try {
      const user = await app.logIn(credentials);
      const mongodb = user.mongoClient('mongodb-atlas');
      const db = mongodb.db('todo');
      const newProduct = { _id: new Realm.BSON.ObjectId(), task };

      const productsCollection = db.collection('Task');
      await productsCollection.insertOne(newProduct);

      setTask('');

      await fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const updateProduct = async () => {
    try {
      const user = await app.logIn(credentials);
      const mongodb = user.mongoClient('mongodb-atlas');
      const db = mongodb.db('todo');

      const productsCollection = db.collection('Task');

      await productsCollection.updateOne(
        { _id: editingProduct._id },
        { $set: { task } }
      );

      setEditingProduct(null);
      setTask('');

      await fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const user = await app.logIn(credentials);
      const mongodb = user.mongoClient('mongodb-atlas');
      const db = mongodb.db('todo');

      const productsCollection = db.collection('Task');
      await productsCollection.deleteOne({ _id: productId });

      await fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditProduct = (product) => {
    setTask(product.task);
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setTask('');
    setEditingProduct(null);
  };

  return (
    <>
      <IonItem>
        <IonLabel position="floating">Type</IonLabel>
        <IonInput
          value={task}
          onInput={(e) => setTask(e.target.value)}
        ></IonInput>
      </IonItem>

      {editingProduct ? (
        <>
          <IonButton expand="full" color="warning" onClick={updateProduct}>
            Update Product
          </IonButton>
          <IonButton expand="full" color="danger" onClick={handleCancelEdit}>
            Cancel
          </IonButton>
        </>
      ) : (
        <IonButton expand="full" color="success" onClick={addProduct}>
          Add Product
        </IonButton>
      )}

      <br />
      <h1>PRODUCTS</h1>
      {products.map((product, index) => (
        <IonItem key={index}>
          <IonLabel>
            <h1>{product.task}</h1>
          </IonLabel>
          <IonButton color="warning" onClick={() => handleEditProduct(product)}>
            Edit
          </IonButton>
          <IonButton color="danger" onClick={() => handleDeleteProduct(product._id)}>
            Delete
          </IonButton>
        </IonItem>
      ))}

      {/* <IonButton expand="full" color="secondary" onClick={() => history.push('/status')}>
        Check Connection Status
      </IonButton> */}
    </>
  );
};

export default ExploreContainer;
