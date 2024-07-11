// src/addData.ts
import { db } from './main';

const addData = async () => {
    try {
        const docRef = await db.collection('users').add({
            firstName: 'Paweł',
            lastName: 'Musiał',
            email: 'pawelmusial1996@gmial.com'
        });
        console.log('Document written with ID: ', docRef.id);
    } catch (error) {
        console.error('Error adding document: ', error);
    }
};

addData();
