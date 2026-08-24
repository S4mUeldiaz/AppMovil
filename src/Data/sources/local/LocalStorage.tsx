import { AsyncStorage, AsyncStorageError} from "@react-native-async-storage/async-storage";

export const LocalStorage = () => {
    const save = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.log('Error en Local Storage:' + error);
        }
    }

    const getItem = async (Key: string) => {
        try {
            const item = await AsyncStorage.getItem(Key);
            return item;

        } catch (error) {
            console.log('Error en Local Storage' + error);
        }
    }

    const remove = async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            
        }
    }
}