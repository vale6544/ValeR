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
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

export default function CamaraGuiada({ onVideoSelected, onCancel }) {
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);

  // Estados de Permisos
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);

  // Cámara trasera estándar ultra estable
  const device = useCameraDevice('back');

  // Estados del Acelerómetro (Guía Visual e Inclinación)
  const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0 });
  const [isAngleOptimal, setIsAngleOptimal] = useState(false);
  const [isSpeedOptimal, setIsSpeedOptimal] = useState(true);

  const prevSensorData = useRef({ x: 0, y: 0, z: 0 });
  const lastVibrationTime = useRef(0);
  const wasOptimalRef = useRef(false);

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
        
        // Inclinación natural y cómoda
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
        } catch (eHaptics) {}
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

  // Solicitar Permisos Automáticamente al Abrir
  useEffect(() => {
    if (Platform.OS === 'web') {
      setPermissionsChecked(true);
      return;
    }
    
    let isMounted = true;

    const requestPermissionsAutomaticamente = async () => {
      try {
        let cameraStatus = await Camera.getCameraPermissionStatus();
        let microphoneStatus = await Camera.getMicrophonePermissionStatus();

        if (cameraStatus !== 'granted') {
          cameraStatus = await Camera.requestCameraPermission();
        }
        if (microphoneStatus !== 'granted') {
          microphoneStatus = await Camera.requestMicrophonePermission();
        }

        if (isMounted) {
          setHasCameraPermission(cameraStatus === 'granted');
          setHasMicrophonePermission(microphoneStatus === 'granted');
        }
      } catch (err) {
        console.warn("Error solicitando permisos automáticamente:", err);
        if (isMounted) {
          setHasCameraPermission(true);
          setHasMicrophonePermission(true);
        }
      } finally {
        if (isMounted) {
          setPermissionsChecked(true);
        }
      }
    };

    requestPermissionsAutomaticamente();
  }, []);

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
          await FileSystem.copyAsync({ from: file.uri, to: permanentUri });
          onVideoSelected({
            uri: permanentUri,
            name: fileName,
            mimeType: file.mimeType || 'video/mp4',
          });
        } catch (e) {
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

  const toggleRecording = async () => {
    if (cameraRef.current) {
      if (recording) {
        try {
          await cameraRef.current.stopRecording();
          setRecording(false);
        } catch (error) {
          console.error("Error al detener grabación:", error);
          setRecording(false);
        }
      } else {
        try {
          setRecording(true);
          cameraRef.current.startRecording({
            onRecordingFinished: async (video) => {
              setRecording(false);
              try {
                const tempUri = video.path.startsWith('file://') ? video.path : `file://${video.path}`;
                const fileName = `video_camara_${Date.now()}.mp4`;
                const permanentUri = FileSystem.documentDirectory + fileName;

                await FileSystem.copyAsync({ from: tempUri, to: permanentUri });

                onVideoSelected({
                  uri: permanentUri,
                  name: fileName,
                  mimeType: 'video/mp4',
                });
              } catch (errFile) {
                onVideoSelected({
                  uri: video.path.startsWith('file://') ? video.path : `file://${video.path}`,
                  name: `video_camara_${Date.now()}.mp4`,
                  mimeType: 'video/mp4',
                });
              }
            },
            onRecordingError: (error) => {
              console.error("Error de grabación:", error);
              Alert.alert("Error", "Ocurrió un error durante la grabación.");
              setRecording(false);
            }
          });
        } catch (error) {
          console.error("Error al iniciar grabación:", error);
          Alert.alert("Error", "No se pudo iniciar la grabación del video.");
          setRecording(false);
        }
      }
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webCard}>
          <Text style={styles.webTitle}>Cámara Guiada (Navegador Web)</Text>
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

  // 1. Cargando cámara y permisos en segundo plano
  if (!permissionsChecked || device == null) {
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

  // 2. Permisos no otorgados
  const isPermissionGranted = hasCameraPermission && hasMicrophonePermission;
  if (!isPermissionGranted && permissionsChecked) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Acceso Requerido</Text>
        <Text style={styles.permissionText}>
          Se necesitan los permisos de Cámara y Micrófono para grabar el video de la cama.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={onCancel}>
          <Text style={styles.permissionBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Renderizado de Cámara Guiada en Vivo
  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={[StyleSheet.absoluteFillObject, { flex: 1 }]}
        device={device}
        isActive={true}
        video={true}
        audio={true}
        resizeMode="contain"
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

      {/* Botón Superior para Cerrar */}
      <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
        <View style={styles.closeIconContainer}>
          <Text style={styles.closeText}>X</Text>
        </View>
      </TouchableOpacity>

      {/* Controles Inferiores: Galería a la izquierda y Grabar al centro */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.galleryButton} onPress={abrirGaleria}>
          <View style={styles.galleryIcon}>
            <View style={styles.galleryInnerIcon} />
          </View>
          <Text style={styles.controlLabel}>Galería</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.recordButton, recording && styles.recordButtonActive]}
          onPress={toggleRecording}
        >
          <View style={[styles.recordButtonInner, recording && styles.recordButtonInnerActive]} />
        </TouchableOpacity>

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
    justifyContent: 'space-around',
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
