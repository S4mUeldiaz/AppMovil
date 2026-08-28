import { StackScreenProps } from '@react-navigation/stack';
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
            onPress={async () => {
                await removeSession();
                navigation.replace('HomeScreen');
            }}
            title='Cerrar Sesión'
            />
        </View>
    );
}
