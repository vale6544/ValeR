import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

export default function CamaraGuiada({ onVideoSelected, onCancel }) {
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);

  // Permisos Oficiales e Indestructibles de Expo Camera
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // Estados del Acelerómetro (Guía Táctil y Visual)
  const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0 });
  const [isAngleOptimal, setIsAngleOptimal] = useState(false);
  const [isSpeedOptimal, setIsSpeedOptimal] = useState(true);

  // Referencias para feedback táctil
  const prevSensorData = useRef({ x: 0, y: 0, z: 0 });
  const lastVibrationTime = useRef(0);
  const wasOptimalRef = useRef(false);

  // Configurar acelerómetro y suscripción
  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsAngleOptimal(true);
      setIsSpeedOptimal(true);
      return;
    }

    let subscription = null;
    try {
      Accelerometer.setUpdateInterval(250);

      subscription = Accelerometer.addListener((accelerometerData) => {
        setSensorData(accelerometerData);
        
        // Inclinación natural y cómoda: teléfono inclinado mirando hacia la hilera de la cama
        const zAbs = Math.abs(accelerometerData.z);
        const yAbs = Math.abs(accelerometerData.y);
        const angleOk = (zAbs >= 0.18 && zAbs <= 0.92) || (yAbs >= 0.22 && yAbs <= 0.92);
        setIsAngleOptimal(angleOk);

        // Control de Velocidad de Barrido
        const prev = prevSensorData.current;
        const deltaX = Math.abs(accelerometerData.x - prev.x);
        const deltaY = Math.abs(accelerometerData.y - prev.y);
        const deltaZ = Math.abs(accelerometerData.z - prev.z);
        const deltaTotal = deltaX + deltaY + deltaZ;
        
        const speedOk = deltaTotal < 0.35;
        setIsSpeedOptimal(speedOk);

        prevSensorData.current = accelerometerData;

        const now = Date.now();
        const isCurrentlyOptimal = angleOk && speedOk;

        try {
          if (!isCurrentlyOptimal && (now - lastVibrationTime.current > 1500)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            lastVibrationTime.current = now;
          }

          if (isCurrentlyOptimal && !wasOptimalRef.current) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        } catch (eHaptics) {
          // Ignorar errores de motor vibratorio si el celular no lo soporta
        }
        wasOptimalRef.current = isCurrentlyOptimal;
      });
    } catch (eSensor) {
      console.warn("Error iniciando acelerómetro:", eSensor);
    }

    return () => {
      if (subscription) {
        try { subscription.remove(); } catch (e) {}
      }
    };
  }, []);

  // Abrir galería reciente con guardado seguro permanente en el almacenamiento del dispositivo
  const abrirGaleria = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Requerido', 'Se necesita permiso para acceder a tus videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileName = file.fileName || `video_galeria_${Date.now()}.mp4`;
        const permanentUri = FileSystem.documentDirectory + fileName;

        try {
          await FileSystem.copyAsync({
            from: file.uri,
            to: permanentUri
          });
          onVideoSelected({
            uri: permanentUri,
            name: fileName,
            mimeType: file.mimeType || 'video/mp4',
          });
        } catch (e) {
          console.error("Error copiando archivo de galeria a permanente:", e);
          onVideoSelected({
            uri: file.uri,
            name: fileName,
            mimeType: file.mimeType || 'video/mp4',
          });
        }
      }
    } catch (error) {
      console.error("Error al abrir galería:", error);
      Alert.alert("Error", "No se pudo acceder a la galería de videos.");
    }
  };

  // Grabar / Detener grabación con Expo CameraView
  const toggleRecording = async () => {
    if (!cameraRef.current) return;

    if (recording) {
      try {
        cameraRef.current.stopRecording();
        setRecording(false);
      } catch (error) {
        console.error("Error al detener grabación:", error);
        setRecording(false);
      }
    } else {
      try {
        setRecording(true);
        const videoPromise = cameraRef.current.recordAsync({
          maxDuration: 60,
          quality: '1080p',
        });

        const video = await videoPromise;
        setRecording(false);

        if (video && video.uri) {
          const tempUri = video.uri;
          const fileName = `video_camara_${Date.now()}.mp4`;
          const permanentUri = FileSystem.documentDirectory + fileName;

          try {
            await FileSystem.copyAsync({
              from: tempUri,
              to: permanentUri
            });
            onVideoSelected({
              uri: permanentUri,
              name: fileName,
              mimeType: 'video/mp4',
            });
          } catch (errFile) {
            console.error("Error copiando a ruta permanente:", errFile);
            onVideoSelected({
              uri: tempUri,
              name: fileName,
              mimeType: 'video/mp4',
            });
          }
        }
      } catch (error) {
        console.error("Error al iniciar grabación:", error);
        Alert.alert("Error", "No se pudo realizar la grabación.");
        setRecording(false);
      }
    }
  };

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webCard}>
          <Text style={styles.webTitle}>Cámara Guiada (Navegador Web)</Text>
          <Text style={styles.webText}>
            Selecciona un video de prueba desde tu computadora para simular la captura de video:
          </Text>
          <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: '#1e3f1a', marginVertical: 12 }]} onPress={abrirGaleria}>
            <Text style={styles.permissionBtnText}>Seleccionar Video de Prueba</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: '#718096' }]} onPress={onCancel}>
            <Text style={styles.permissionBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 1. Cargando estado de permisos
  if (!cameraPermission || !micPermission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#2d5a27" />
        <Text style={[styles.permissionText, { marginTop: 15 }]}>Inicializando cámara...</Text>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: '#718096', marginTop: 25 }]} onPress={onCancel}>
          <Text style={styles.permissionBtnText}>Cancelar / Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2. Permisos Denegados o no solicitados aún
  if (!cameraPermission.granted || !micPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Acceso Requerido</Text>
        <Text style={styles.permissionText}>
          Se necesitan los permisos de Cámara y Micrófono para grabar el video de la cama.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={async () => {
          await requestCameraPermission();
          await requestMicPermission();
        }}>
          <Text style={styles.permissionBtnText}>Otorgar Permisos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: '#718096', marginTop: 12 }]} onPress={onCancel}>
          <Text style={styles.permissionBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Vista Activa de Cámara Guiada en Vivo con CameraView de Expo
  return (
    <View style={styles.container}>
      {/* Vista de Cámara Oficial Expo SDK 51 */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        mode="video"
      />

      {/* Guía Visual Superpuesta */}
      <View style={styles.overlayContainer} pointerEvents="none">
        {!isAngleOptimal ? (
          <View style={[styles.guideBanner, styles.dangerBanner]}>
            <Text style={styles.guideText}>Incline la cámara hacia abajo (apuntando a la cama)</Text>
          </View>
        ) : !isSpeedOptimal ? (
          <View style={[styles.guideBanner, styles.warningBanner]}>
            <Text style={styles.guideText}>Camine más despacio (barrido rápido)</Text>
          </View>
        ) : (
          <View style={[styles.guideBanner, styles.successBanner]}>
            <Text style={styles.guideText}>Ángulo óptimo</Text>
          </View>
        )}
      </View>

      {/* Botón superior para cerrar/cancelar */}
      <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
        <View style={styles.closeIconContainer}>
          <Text style={styles.closeText}>X</Text>
        </View>
      </TouchableOpacity>

      {/* Controles de cámara en la parte inferior */}
      <View style={styles.bottomControls}>
        {/* Galería (Izquierda) */}
        <TouchableOpacity style={styles.galleryButton} onPress={abrirGaleria}>
          <View style={styles.galleryIcon}>
            <View style={styles.galleryInnerIcon} />
          </View>
          <Text style={styles.controlLabel}>Galería</Text>
        </TouchableOpacity>

        {/* Grabación Central */}
        <TouchableOpacity
          style={[styles.recordButton, recording && styles.recordButtonActive]}
          onPress={toggleRecording}
        >
          <View style={[styles.recordButtonInner, recording && styles.recordButtonInnerActive]} />
        </TouchableOpacity>

        {/* Espaciador Derecha */}
        <View style={{ width: 60 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#f4f7f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3d16',
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  permissionBtn: {
    backgroundColor: '#2d5a27',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#f4f7f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3d16',
    marginBottom: 12,
  },
  webText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 10,
    lineHeight: 20,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  guideBanner: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '85%',
  },
  dangerBanner: {
    backgroundColor: 'rgba(229, 62, 62, 0.9)',
  },
  warningBanner: {
    backgroundColor: 'rgba(221, 107, 32, 0.9)',
  },
  successBanner: {
    backgroundColor: 'rgba(56, 161, 105, 0.9)',
  },
  guideText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justify.content: 'space-around',
    paddingHorizontal: 20,
  },
  galleryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  galleryIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  galleryInnerIcon: {
    width: 20,
    height: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 2,
  },
  controlLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  recordButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  recordButtonActive: {
    borderColor: '#e53e3e',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e53e3e',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
});
