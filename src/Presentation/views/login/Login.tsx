import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '../../../Data/sources/remote/api/Authapi';
import { colors, fonts, spacing } from '../../theme/AppTheme';

export function LoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function mostrarError(msg: string) {
    setError(msg);
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.LONG);
    } else {
      Alert.alert('Error', msg);
    }
  }

  async function handleSubmit() {
    setError('');
    setCargando(true);
    try {
      const usuario = await login(correo, password);
      (navigation as any).reset({
        index: 0,
        routes: [{ name: usuario.nombre_rol === 'admin' ? 'AdminTabs' : 'MainTabs' }],
      });
    } catch (err: any) {
      mostrarError(err?.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  }

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={[styles.wrapperContent, { paddingTop: insets.top + spacing.lg }]}
    >
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.logo}>VELYSH</Text>
        <View style={styles.backButton} />
      </View>

      <Text style={styles.title}>¿Deseas iniciar sesión?</Text>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.group}>
            <Feather name="mail" size={16} color={colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={correo}
              onChangeText={setCorreo}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.group}>
            <Feather name="lock" size={16} color={colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!verPassword}
            />
            <TouchableOpacity onPress={() => setVerPassword((prev) => !prev)}>
              <Feather
                name={verPassword ? 'eye-off' : 'eye'}
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, cargando && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={cargando}
        >
          <Text style={styles.buttonText}>
            {cargando ? 'VERIFICANDO...' : 'INICIAR SESIÓN'}
          </Text>
        </TouchableOpacity>

        {/* "Olvidaste tu contraseña" — pantalla de recuperación aún no existe en el móvil */}
        <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.googleButton} disabled>
          <FontAwesome name="google" size={16} color={colors.text} />
          <Text style={styles.googleText}>Continuar con Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No estás registrado? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen' as never)}>
            <Text style={styles.footerLink}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrapperContent: {
    paddingHorizontal: 24,
    paddingBottom: 64,
    alignItems: 'center',
  },
  topbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    width: 32,
  },
  logo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 6,
    color: colors.text,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 32,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    fontFamily: fonts.body,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: fonts.body,
  },
  forgot: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
  },
  googleText: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.text,
    fontFamily: fonts.body,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  footerLink: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    textDecorationLine: 'underline',
    fontFamily: fonts.body,
  },
});