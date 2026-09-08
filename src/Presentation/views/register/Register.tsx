import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ToastAndroid, Platform, Alert,} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { registrar, RegistroPayload } from '../../../Data/sources/remote/api/Authapi';
import { colors } from '../../theme/AppTheme';

type RegisterForm = RegistroPayload;

export function RegisterScreen() {
  const navigation = useNavigation();

  const [form, setForm] = useState<RegisterForm>({
    numero_documento: '',
    id_tipo_documento: 1,
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    password: '',
    id_rol: 2,
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function handleChange(campo: keyof RegisterForm, valor: string | number) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

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

    if (!/^\d+$/.test(form.numero_documento)) {
      mostrarError('El número de documento solo puede contener números');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre)) {
      mostrarError('El nombre solo puede contener letras');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.apellido)) {
      mostrarError('El apellido solo puede contener letras');
      return;
    }
    if (!/^\d+$/.test(form.telefono)) {
      mostrarError('El teléfono solo puede contener números');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      mostrarError('Ingresa un correo electrónico válido');
      return;
    }
    if (form.password !== confirmPassword) {
      mostrarError('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      await registrar(form);
      navigation.navigate('Login' as never);
    } catch (err: any) {
      mostrarError(
        err?.response?.data?.error || err?.message || 'No se pudo completar el registro'
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.wrapperContent}>
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

      <Text style={styles.title}>¿Deseas registrarte?</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 0.6 }]}>
            <Text style={styles.label}>Tipo doc.</Text>
            <View style={styles.group}>
              <Feather
                name="credit-card"
                size={16}
                color={colors.textMuted}
                style={styles.icon}
              />
              <Picker
                selectedValue={form.id_tipo_documento}
                onValueChange={(valor) => handleChange('id_tipo_documento', valor)}
                style={styles.picker}
                dropdownIconColor={colors.textMuted}
                mode="dropdown"
              >
                <Picker.Item label="Cédula" value={1} />
                <Picker.Item label="C. extranjería" value={2} />
                <Picker.Item label="T. identidad" value={3} />
                <Picker.Item label="Pasaporte" value={4} />
                <Picker.Item label="NIT" value={5} />
              </Picker>
            </View>
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Número documento</Text>
            <View style={styles.group}>
              <Feather
                name="credit-card"
                size={16}
                color={colors.textMuted}
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={form.numero_documento}
                onChangeText={(v) => handleChange('numero_documento', v)}
                placeholder="0000000000"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombres</Text>
            <View style={styles.group}>
              <Feather name="user" size={16} color={colors.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                value={form.nombre}
                onChangeText={(v) => handleChange('nombre', v)}
                placeholder="Nombre"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Apellidos</Text>
            <View style={styles.group}>
              <Feather name="user" size={16} color={colors.textMuted} style={styles.icon} />
              <TextInput
                style={styles.input}
                value={form.apellido}
                onChangeText={(v) => handleChange('apellido', v)}
                placeholder="Apellido"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nro. celular</Text>
          <View style={styles.group}>
            <Feather name="phone" size={16} color={colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={form.telefono}
              onChangeText={(v) => handleChange('telefono', v)}
              placeholder="300 000 0000"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.group}>
            <Feather name="mail" size={16} color={colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={form.correo}
              onChangeText={(v) => handleChange('correo', v)}
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
              value={form.password}
              onChangeText={(v) => handleChange('password', v)}
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

        <View style={styles.field}>
          <Text style={styles.label}>Confirmación de contraseña</Text>
          <View style={styles.group}>
            <Feather name="lock" size={16} color={colors.textMuted} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!verPassword}
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, cargando && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={cargando}
        >
          <Text style={styles.buttonText}>
            {cargando ? 'REGISTRANDO...' : 'REGISTRARME'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  wrapperContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
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
    fontFamily: 'InriaSerif_400Regular',
    fontSize: 26,
    letterSpacing: 6,
    color: colors.text,
  },
  title: {
    fontFamily: 'InriaSerif_400Regular',
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 32,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 420,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    marginBottom: 18,
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    fontFamily: 'Inter_400Regular',
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
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
    fontFamily: 'Inter_400Regular',
  },
  picker: {
    flex: 1,
    color: colors.text,
    height: 48,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
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
    color: colors.bg,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    textDecorationLine: 'underline',
    fontFamily: 'Inter_400Regular',
  },
});