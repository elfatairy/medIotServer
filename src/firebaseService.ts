import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase";
import { getDatabase, ref, set, get, child } from "firebase/database";

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