import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/AppTheme";

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
        backgroundColor: colors.primary,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    TextButton: {
        color: colors.onPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RoundedButton