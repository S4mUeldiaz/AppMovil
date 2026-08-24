import { StackScreenProps } from '@react-navigation/Stack';
import React from 'react';
import { View, Text, Button } from 'react-native';
import { RootStackParamList } from '../../../../../App';
import useViewModel from './ViewModel';

interface Props extends StackScreenProps<RootStackParamList, 'ProfileInfoScreen'> {};

export const ProfileInfoScreen = ({ navigation, route }: Props) => {

    const { removeSession } = useViewModel();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button
            onPress={() => {
                removeSession();
                navigation.replace('Homescreen');
            }}
            title='Cerrar Sesión'
            />
        </View>
    );
}
