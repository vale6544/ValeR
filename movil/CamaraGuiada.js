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
import { Camera, useCameraDevices, useCameraDevice } from 'react-native-vision-camera';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

export default function CamaraGuiada({ onVideoSelected, onCancel }) {
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [zoom, setZoom] = useState(0);
  
  const [useUltraWide, setUseUltraWide] = useState(true);

  // Dispositivos de Cámara y Zoom con fallback robusto
  const devices = useCameraDevices();
  const defaultBackDevice = useCameraDevice('back');
  const backDevices = Array.isArray(devices) ? devices.filter(d => d.position === 'back') : [];
  const ultraWideDevice = backDevices.find(d => 
    d.physicalDevices && Array.isArray(d.physicalDevices) && d.physicalDevices.includes('ultra-wide-angle-camera')
  );
  
  // Selección segura: si ultraWide existe y está activo, usarlo; de lo contrario usar la trasera estándar
  const device = (useUltraWide && ultraWideDevice) 
    ? ultraWideDevice 
    : (defaultBackDevice || backDevices[0] || (Array.isArray(devices) && devices.length > 0 ? devices[0] : null));

  // Permisos de Cámara y Micrófono
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);

  // Estados del Acelerómetro
  const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0 });
  const [isAngleOptimal, setIsAngleOptimal] = useState(false);
  const [isSpeedOptimal, setIsSpeedOptimal] = useState(true);

  // Referencias para la lógica de feedback
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

    // Configurar tasa de refresco a 250ms (evita lag en el hilo de React Native)
    Accelerometer.setUpdateInterval(250);

    const subscription = Accelerometer.addListener((accelerometerData) => {
      setSensorData(accelerometerData);
      
      // 1. Lógica de Inclinación: Apuntar perpendicularmente al suelo (teléfono plano)
      // La gravedad actúa sobre el eje Z. Si |z| > 0.85, el ángulo es menor de ~30 grados de la horizontal.
      const zAbs = Math.abs(accelerometerData.z);
      const angleOk = zAbs > 0.85;
      setIsAngleOptimal(angleOk);

      // 2. Lógica de Velocidad: Calcular cambio (delta) entre lecturas sucesivas
      const prev = prevSensorData.current;
      const deltaX = Math.abs(accelerometerData.x - prev.x);
      const deltaY = Math.abs(accelerometerData.y - prev.y);
      const deltaZ = Math.abs(accelerometerData.z - prev.z);
      const deltaTotal = deltaX + deltaY + deltaZ;
      
      // Si el delta total excede el umbral en 250ms, el movimiento es brusco
      const speedOk = deltaTotal < 0.28;
      setIsSpeedOptimal(speedOk);

      // Guardar lectura para la siguiente comparación
      prevSensorData.current = accelerometerData;

      // 3. Feedback Táctil de Advertencia (Throttled a 1.5s para no saturar)
      const now = Date.now();
      const isCurrentlyOptimal = angleOk && speedOk;

      if (!isCurrentlyOptimal && (now - lastVibrationTime.current > 1500)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        lastVibrationTime.current = now;
      }

      // 4. Feedback Positivo de Éxito al entrar en Estado Óptimo
      if (isCurrentlyOptimal && !wasOptimalRef.current) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      wasOptimalRef.current = isCurrentlyOptimal;
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Verificar permisos al montar
  useEffect(() => {
    if (Platform.OS === 'web') {
      setPermissionsChecked(true);
      return;
    }
    (async () => {
      const cameraStatus = await Camera.getCameraPermissionStatus();
      const microphoneStatus = await Camera.getMicrophonePermissionStatus();
      setHasCameraPermission(cameraStatus === 'granted');
      setHasMicrophonePermission(microphoneStatus === 'granted');
      setPermissionsChecked(true);
    })();
  }, []);

  const requestPermissions = async () => {
    const cameraStatus = await Camera.requestCameraPermission();
    const microphoneStatus = await Camera.requestMicrophonePermission();
    setHasCameraPermission(cameraStatus === 'granted');
    setHasMicrophonePermission(microphoneStatus === 'granted');
  };

  // Retorno temprano para versión Web para evitar evaluar permisos de hardware
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webCard}>
          <Text style={styles.webTitle}>Cámara Guiada (Navegador Web)</Text>
          <Text style={styles.webText}>
            La simulación de sensores de inclinación y la cámara en vivo no están soportadas en el navegador web debido a restricciones de hardware.
          </Text>
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

  // 1. Cargando permisos
  if (!permissionsChecked) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#2d5a27" />
        <Text style={[styles.permissionText, { marginTop: 15 }]}>Cargando cámara...</Text>
      </View>
    );
  }

  // 2. Permisos Denegados (isGranted === false)
  const isPermissionGranted = hasCameraPermission && hasMicrophonePermission;
  if (!isPermissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Acceso Requerido</Text>
        <Text style={styles.permissionText}>
          Se necesitan los permisos de Cámara y Micrófono para poder guiarte y grabar el video de la cama.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermissions}
        >
          <Text style={styles.permissionBtnText}>Otorgar Permisos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: '#718096', marginTop: 12 }]} onPress={onCancel}>
          <Text style={styles.permissionBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Detectando hardware de cámara (Con opción de selección de archivo en galería)
  if (device == null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#2d5a27" />
        <Text style={[styles.permissionTitle, { marginTop: 15 }]}>Inicializando Cámara</Text>
        <Text style={[styles.permissionText, { marginBottom: 15 }]}>
          Si la vista en vivo tarda en iniciar, puedes seleccionar un video grabado previamente desde tu galería o archivos.
        </Text>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: '#1e3f1a', marginVertical: 6 }]} onPress={abrirGaleria}>
          <Text style={styles.permissionBtnText}>Seleccionar Video desde Galería</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: '#718096', marginTop: 6 }]} onPress={onCancel}>
          <Text style={styles.permissionBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Grabar / Detener grabación con Vision Camera
  const toggleRecording = async () => {
    if (cameraRef.current) {
      if (recording) {
        try {
          await cameraRef.current.stopRecording();
          setRecording(false);
        } catch (error) {
          console.error("Error al detener grabación:", error);
        }
      } else {
        try {
          setRecording(true);
          // Vibración táctil de inicio de grabación
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          
          await cameraRef.current.startRecording({
            onRecordingFinished: (video) => {
              onVideoSelected({
                uri: 'file://' + video.path,
                name: `video_${Date.now()}.mp4`,
                mimeType: 'video/mp4',
              });
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

  // Abrir galería reciente
  const abrirGaleria = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        onVideoSelected({
          uri: file.uri,
          name: file.fileName || `video_galeria_${Date.now()}.mp4`,
          mimeType: file.mimeType || 'video/mp4',
        });
      }
    } catch (error) {
      console.error("Error al abrir galería:", error);
      Alert.alert("Error", "No se pudo acceder a la galería de videos.");
    }
  };

  const isOptimal = isAngleOptimal && isSpeedOptimal;

  return (
    <View style={styles.container}>
      {/* Vista de Cámara */}
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
            <Text style={styles.guideText}>Incline la cámara hacia abajo (paralela a la cama)</Text>
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
          <View style={[styles.recordInnerButton, recording && styles.recordInnerButtonActive]} />
        </TouchableOpacity>

        {/* Control de Lente Físico (0.5x / 1x) */}
        {ultraWideDevice ? (
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => {
              setUseUltraWide(prev => !prev);
            }}
          >
            <Text style={styles.zoomButtonText}>
              {device === ultraWideDevice ? '0.5x' : '1x'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f4',
    padding: 20,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#2d5a27',
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: '#2d5a27',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f4',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d5a27',
    marginBottom: 12,
  },
  overlayContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  guideBanner: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: '90%',
  },
  dangerBanner: {
    backgroundColor: '#ef4444',
  },
  warningBanner: {
    backgroundColor: '#f97316',
  },
  successBanner: {
    backgroundColor: '#22c55e',
  },
  guideText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 45,
    left: 20,
    zIndex: 1000,
    padding: 10,
  },
  closeIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    zIndex: 1000,
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
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryInnerIcon: {
    width: 24,
    height: 18,
    borderRadius: 2,
    backgroundColor: 'white',
    opacity: 0.8,
  },
  controlLabel: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recordButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    borderColor: '#ef4444',
  },
  recordInnerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },
  recordInnerButtonActive: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    width: 28,
    height: 28,
  },
  zoomButton: {
    width: 60,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1.5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#f4f6f4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 500,
    width: '100%',
    alignItems: 'center',
  },
  webTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d5a27',
    marginBottom: 12,
    textAlign: 'center',
  },
  webText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
});
