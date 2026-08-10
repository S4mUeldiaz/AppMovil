import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { MyColors } from "../../theme/AppTheme";

interface Props {
    text: string;
    onPress: () => void,
}

export const RoundedButton = ({ text, onPress}: Props) => {
    return (
        <TouchableOpacity
        style={styles.RoundedButton}
        onPress={() => onPress()}
    >
        <Text style={styles.TextButton}>
            {text}
        </Text>
    </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    RoundedButton: {
        backgroundColor: 'orange',
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    TextButton: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RoundedButton