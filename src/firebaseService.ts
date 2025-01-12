import { initializeApp } from "firebase/app";

import { getDatabase, ref, set, get, child } from "firebase/database";

const firebaseConfig = {
    apiKey: "",
    authDomain: "esp32-16690.firebaseapp.com",
    databaseURL:
        "https://esp32-16690-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "esp32-16690",
    storageBucket: "esp32-16690.appspot.com",
    messagingSenderId: "270762185717",
    appId: "1:270762185717:web:7712bb5b437b935fab46bc",
    measurementId: "G-P76M6SCGSH",
};

export const _ = initializeApp(firebaseConfig); 

export const db = getDatabase();

const dbRef = ref(db);

export const saveToken = async (token: any) => {
    const values = (await get(child(dbRef, "userTokens"))).val() ?? {};
    const payload = { ...values, token };

    set(ref(db, "userTokens"), payload);
};

export const getToken = async () => {
    const values = (await get(child(dbRef, "userTokens/token"))).val();

    return values ?? {};
};

export const getTemprature = async () => {
    const value = (await get(child(dbRef, "temperature/value"))).val();
    return value;
};

export const getHumidity = async () => {
    const value = (await get(child(dbRef, "humidity/value"))).val();
    return value;
};

export const getEmergency = async () => {
    const value = (await get(child(dbRef, "emergency/value"))).val();
    return value;
};

export const getAirQuality = async () => {
    const value = (await get(child(dbRef, "airquality/value"))).val();
    return value;
};


export const setDisease = async (value: string) => {
    await set(child(dbRef, "disease/value"), value);
};