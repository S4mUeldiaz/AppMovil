import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, Image, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sidebar } from '../../components/Sidebar';
import { TopNavbar } from '../../components/TopNavbar';
import { useSidebar } from '../../hooks/useSidebar';
import { guardarUsuarioActual } from '../../../Data/sources/remote/api/Authapi';
import { actualizarUsuario, cambiarPassword, eliminarCuenta } from '../../../Data/sources/remote/api/UsuariosApi';
import { obtenerFotoPerfil, guardarFotoPerfil } from '../../../Data/sources/local/FotoPerfilStorage';
import { colors, fonts, radius, spacing } from '../../theme/AppTheme';

export function PerfilScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { abierto, abrir, cerrar, usuario, cerrarSesion, setUsuario } = useSidebar();

  const [form, setForm] = useState({
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    telefono: usuario?.telefono ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre ?? '',
        apellido: usuario.apellido ?? '',
        telefono: usuario.telefono ?? '',
      });
    }
  }, [usuario]);

  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [modalFotoVisible, setModalFotoVisible] = useState(false);
  const [visorVisible, setVisorVisible] = useState(false);

  useEffect(() => {
    if (usuario) {
      obtenerFotoPerfil(usuario.numero_documento).then(setFotoUri);
    } else {
      setFotoUri(null);
    }
  }, [usuario]);

  async function elegirFoto(origen: 'camara' | 'galeria') {
    if (!usuario) return;
    setModalFotoVisible(false);

    const permiso =
      origen === 'camara'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert(
        'Permiso necesario',
        origen === 'camara'
          ? 'Activa el permiso de cámara desde Ajustes para tomar tu foto de perfil.'
          : 'Activa el permiso de fotos desde Ajustes para elegir tu foto de perfil.'
      );
      return;
    }

    const opciones: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    };
    const resultado =
      origen === 'camara'
        ? await ImagePicker.launchCameraAsync(opciones)
        : await ImagePicker.launchImageLibraryAsync(opciones);

    if (resultado.canceled || !resultado.assets[0]) return;

    try {
      const uriPersistente = await guardarFotoPerfil(usuario.numero_documento, resultado.assets[0].uri);
      setFotoUri(uriPersistente);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la foto, intenta de nuevo.');
    }
  }

  const [passwordForm, setPasswordForm] = useState({ password_actual: '', password_nueva: '' });
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [mensajePassword, setMensajePassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');

  const [modalEliminar, setModalEliminar] = useState(false);
  const [passwordEliminar, setPasswordEliminar] = useState('');
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  async function handleLogout() {
    await cerrarSesion();
    navigation.navigate('LoginScreen' as never);
  }

  async function handleGuardar() {
    if (!usuario) return;
    setGuardando(true);
    setMensaje('');
    setError('');
    try {
      await actualizarUsuario(usuario.numero_documento, form);
      const actualizado = { ...usuario, ...form };
      await guardarUsuarioActual(actualizado);
      setUsuario(actualizado);
      setMensaje('Perfil actualizado exitosamente');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'No se pudo actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarPassword() {
    if (!usuario) return;
    if (!passwordForm.password_actual || !passwordForm.password_nueva) {
      setErrorPassword('Completa ambos campos de contraseña');
      return;
    }
    setGuardandoPassword(true);
    setMensajePassword('');
    setErrorPassword('');
    try {
      await cambiarPassword(usuario.numero_documento, passwordForm);
      setMensajePassword('Contraseña actualizada exitosamente');
      setPasswordForm({ password_actual: '', password_nueva: '' });
    } catch (err: any) {
      setErrorPassword(err?.response?.data?.error || 'No se pudo actualizar la contraseña');
    } finally {
      setGuardandoPassword(false);
    }
  }

  async function handleEliminarCuenta() {
    if (!usuario) return;
    if (!passwordEliminar) {
      setErrorEliminar('Confirma tu contraseña para continuar');
      return;
    }
    setEliminando(true);
    setErrorEliminar('');
    try {
      await eliminarCuenta(usuario.numero_documento, passwordEliminar);
      setModalEliminar(false);
      await cerrarSesion();
      navigation.navigate('LoginScreen' as never);
    } catch (err: any) {
      setErrorEliminar(err?.response?.data?.error || 'No se pudo eliminar la cuenta');
    } finally {
      setEliminando(false);
    }
  }

  if (!usuario) {
    return (
      <View style={styles.wrapper}>
        <TopNavbar onAbrirMenu={abrir} />
        <View style={styles.emptyState}>
          <Feather name="user" size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Inicia sesión para ver tu perfil</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('LoginScreen' as never)}>
            <Text style={styles.emptyBtnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
        <Sidebar abierto={abierto} onCerrar={cerrar} usuario={usuario} onLogout={cerrarSesion} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TopNavbar onAbrirMenu={abrir} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => (fotoUri ? setVisorVisible(true) : setModalFotoVisible(true))}
          >
            <View style={styles.avatarCirculo}>
              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={styles.avatarImg} />
              ) : (
                <Feather name="user" size={40} color={colors.text} />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBadge}
            activeOpacity={0.8}
            onPress={() => setModalFotoVisible(true)}
          >
            <Feather name="camera" size={14} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        {/* DATOS PERSONALES */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Datos personales</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={form.nombre}
            onChangeText={(v) => setForm((p) => ({ ...p, nombre: v }))}
            placeholder="Nombre no registrado"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            value={form.apellido}
            onChangeText={(v) => setForm((p) => ({ ...p, apellido: v }))}
            placeholder="Apellido no registrado"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={usuario.correo} editable={false} />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={form.telefono}
            onChangeText={(v) => setForm((p) => ({ ...p, telefono: v }))}
            placeholder="Teléfono no registrado"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          {!!mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}
          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={[styles.btn, guardando && styles.btnDisabled]} onPress={handleGuardar} disabled={guardando}>
            <Text style={styles.btnText}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text>
          </TouchableOpacity>
        </View>

        {/* CAMBIAR CONTRASEÑA */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Cambiar contraseña</Text>

          <Text style={styles.label}>Contraseña actual</Text>
          <View style={styles.passwordGroup}>
            <TextInput
              style={styles.passwordInput}
              value={passwordForm.password_actual}
              onChangeText={(v) => setPasswordForm((p) => ({ ...p, password_actual: v }))}
              secureTextEntry={!verActual}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setVerActual((v) => !v)}>
              <Feather name={verActual ? 'eye-off' : 'eye'} size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nueva contraseña</Text>
          <View style={styles.passwordGroup}>
            <TextInput
              style={styles.passwordInput}
              value={passwordForm.password_nueva}
              onChangeText={(v) => setPasswordForm((p) => ({ ...p, password_nueva: v }))}
              secureTextEntry={!verNueva}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setVerNueva((v) => !v)}>
              <Feather name={verNueva ? 'eye-off' : 'eye'} size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {!!mensajePassword && <Text style={styles.mensaje}>{mensajePassword}</Text>}
          {!!errorPassword && <Text style={styles.error}>{errorPassword}</Text>}

          <TouchableOpacity
            style={[styles.btn, guardandoPassword && styles.btnDisabled]}
            onPress={handleGuardarPassword}
            disabled={guardandoPassword}
          >
            <Text style={styles.btnText}>{guardandoPassword ? 'Guardando...' : 'Actualizar contraseña'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={16} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {/* ZONA DE PELIGRO*/}
        <TouchableOpacity style={styles.eliminarLink} onPress={() => setModalEliminar(true)}>
          <Text style={styles.eliminarLinkText}>Eliminar mi cuenta</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalEliminar} transparent animationType="fade" onRequestClose={() => setModalEliminar(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Eliminar tu cuenta</Text>
            <Text style={styles.modalTexto}>
              Esta acción es permanente. Confirma tu contraseña para continuar.
            </Text>
            <TextInput
              style={styles.input}
              value={passwordEliminar}
              onChangeText={setPasswordEliminar}
              secureTextEntry
              placeholder="Contraseña"
              placeholderTextColor={colors.textMuted}
            />
            {!!errorEliminar && <Text style={styles.error}>{errorEliminar}</Text>}
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnCancelar}
                onPress={() => {
                  setModalEliminar(false);
                  setPasswordEliminar('');
                  setErrorEliminar('');
                }}
              >
                <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnEliminar, eliminando && styles.btnDisabled]}
                onPress={handleEliminarCuenta}
                disabled={eliminando}
              >
                <Text style={styles.modalBtnEliminarText}>{eliminando ? 'Eliminando...' : 'Eliminar cuenta'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalFotoVisible} transparent animationType="fade" onRequestClose={() => setModalFotoVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Foto de perfil</Text>
            <TouchableOpacity style={styles.fotoOpcionBtn} onPress={() => elegirFoto('camara')}>
              <Feather name="camera" size={18} color={colors.text} />
              <Text style={styles.fotoOpcionText}>Tomar foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fotoOpcionBtn} onPress={() => elegirFoto('galeria')}>
              <Feather name="image" size={18} color={colors.text} />
              <Text style={styles.fotoOpcionText}>Elegir de la galería</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fotoCancelarBtn} onPress={() => setModalFotoVisible(false)}>
              <Text style={styles.fotoCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={visorVisible} transparent animationType="fade" onRequestClose={() => setVisorVisible(false)}>
        <View style={styles.visorRoot}>
          <TouchableOpacity style={styles.visorOverlay} activeOpacity={1} onPress={() => setVisorVisible(false)}>
            {fotoUri && <Image source={{ uri: fotoUri }} style={styles.visorImg} resizeMode="contain" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.visorCerrar, { top: insets.top + spacing.md }]}
            onPress={() => setVisorVisible(false)}
          >
            <Feather name="x" size={22} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </Modal>

      <Sidebar abierto={abierto} onCerrar={cerrar} usuario={usuario} onLogout={cerrarSesion} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  avatar: {
    width: 96,
    height: 96,
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  avatarCirculo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  visorRoot: { flex: 1, backgroundColor: colors.primary },
  visorOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  visorImg: { width: '80%', aspectRatio: 1, borderRadius: radius.lg },
  visorCerrar: {
    position: 'absolute',
    right: spacing.xl,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seccion: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  seccionTitulo: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 15, marginBottom: spacing.md },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  inputDisabled: { opacity: 0.5 },
  passwordGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
  },
  passwordInput: { flex: 1, paddingVertical: spacing.md, color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  mensaje: { color: colors.primary, fontFamily: fonts.body, fontSize: 13, marginTop: spacing.md },
  error: { color: colors.error, fontFamily: fonts.body, fontSize: 13, marginTop: spacing.md },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.onPrimary, fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 0.5 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
  },
  logoutText: { color: colors.error, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  eliminarLink: { alignItems: 'center', paddingVertical: spacing.sm },
  eliminarLinkText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  emptyBtnText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  modalCard: {
    width: '100%',
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  modalTitulo: { color: colors.text, fontFamily: fonts.bodyBold, fontSize: 16, marginBottom: spacing.sm },
  modalTexto: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 13, marginBottom: spacing.lg },
  modalBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  modalBtnCancelar: {
    flex: 1,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalBtnCancelarText: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  modalBtnEliminar: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalBtnEliminarText: { color: colors.onPrimary, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  fotoOpcionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  fotoOpcionText: { color: colors.text, fontFamily: fonts.bodyMedium, fontSize: 14 },
  fotoCancelarBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  fotoCancelarText: { color: colors.text, fontFamily: fonts.bodySemiBold, fontSize: 13 },
});
