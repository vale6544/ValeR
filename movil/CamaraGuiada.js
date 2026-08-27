import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function CamaraGuiada({ onVideoSelected, onCancel }) {
  const cameraRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();

  // Guía Visual e Inclinación
  const [isAngleOptimal, setIsAngleOptimal] = useState(false);
  const [isSpeedOptimal, setIsSpeedOptimal] = useState(true);
  const prevSensorData = useRef({ x: 0, y: 0, z: 0 });
  const lastVibrationTime = useRef(0);
  const wasOptimalRef = useRef(false);

  useEffect(() => {
    let permissionGranted = cameraPermission?.granted && microphonePermission?.granted;
    if (!permissionGranted && cameraPermission !== null && microphonePermission !== null) {
      (async () => {
        if (!cameraPermission?.granted) await requestCameraPermission();
        if (!microphonePermission?.granted) await requestMicrophonePermission();
      })();
    }
  }, [cameraPermission, microphonePermission]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsAngleOptimal(true);
      setIsSpeedOptimal(true);
      return;
    }

    let subscription = null;
    try {
      Accelerometer.setUpdateInterval(250);
      subscription = Accelerometer.addListener((data) => {
        const zAbs = Math.abs(data.z);
        const yAbs = Math.abs(data.y);
        const angleOk = (zAbs >= 0.18 && zAbs <= 0.92) || (yAbs >= 0.22 && yAbs <= 0.92);
        setIsAngleOptimal(angleOk);

        const prev = prevSensorData.current;
        const deltaX = Math.abs(data.x - prev.x);
        const deltaY = Math.abs(data.y - prev.y);
        const deltaZ = Math.abs(data.z - prev.z);
        const speedOk = (deltaX + deltaY + deltaZ) < 0.35;
        setIsSpeedOptimal(speedOk);

        prevSensorData.current = data;

        const now = Date.now();
        const isOptimal = angleOk && speedOk;
        try {
          if (!isOptimal && (now - lastVibrationTime.current > 1500)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            lastVibrationTime.current = now;
          }
          if (isOptimal && !wasOptimalRef.current) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
        } catch (e) {}
        wasOptimalRef.current = isOptimal;
      });
    } catch (e) {}

    return () => {
      if (subscription) try { subscription.remove(); } catch (e) {}
    };
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
    if (recording) {
      try {
        setRecording(false);
        if (cameraRef.current) {
          await cameraRef.current.stopRecording();
        }
      } catch (error) {
        console.error("Error al detener grabación:", error);
        setRecording(false);
      }
    } else {
      if (!cameraRef.current) return;
      try {
        setRecording(true);
        const video = await cameraRef.current.recordAsync({
          maxDuration: 120,
        });
        setRecording(false);

        if (video && video.uri) {
          const fileName = `video_camara_${Date.now()}.mp4`;
          const permanentUri = FileSystem.documentDirectory + fileName;
          try {
            await FileSystem.copyAsync({ from: video.uri, to: permanentUri });
            onVideoSelected({
              uri: permanentUri,
              name: fileName,
              mimeType: 'video/mp4',
            });
          } catch (e) {
            onVideoSelected({
              uri: video.uri,
              name: fileName,
              mimeType: 'video/mp4',
            });
          }
        }
      } catch (error) {
        console.error("Error al grabar video:", error);
        Alert.alert("Error", "No se pudo realizar la grabación del video.");
        setRecording(false);
      }
    }
  };

  if (!cameraPermission || !microphonePermission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#2d5a27" />
        <Text style={[styles.permissionText, { marginTop: 15 }]}>Inicializando cámara...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted || !microphonePermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Se requieren permisos de cámara y micrófono para grabar los recorridos.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={async () => {
          await requestCameraPermission();
          await requestMicrophonePermission();
        }}>
          <Text style={styles.permissionBtnText}>Conceder Permisos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.permissionBtn, { backgroundColor: '#718096', marginTop: 12 }]} onPress={onCancel}>
          <Text style={styles.permissionBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        mode="video"
        mute={false}
      />

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

      <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
        <View style={styles.closeIconContainer}>
          <Text style={styles.closeText}>X</Text>
        </View>
      </TouchableOpacity>

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

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.controlLabel}>Cancelar</Text>
        </TouchableOpacity>
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
    marginBottom: 12,
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
  },
  permissionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  overlayContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  guideBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  dangerBanner: {
    backgroundColor: 'rgba(229, 62, 62, 0.85)',
  },
  warningBanner: {
    backgroundColor: 'rgba(221, 107, 32, 0.85)',
  },
  successBanner: {
    backgroundColor: 'rgba(56, 161, 105, 0.85)',
  },
  guideText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 45,
    right: 20,
    zIndex: 10,
  },
  closeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  galleryButton: {
    alignItems: 'center',
  },
  galleryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryInnerIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    borderColor: '#e53e3e',
  },
  recordButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e53e3e',
  },
  recordButtonInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#e53e3e',
  },
  cancelButton: {
    alignItems: 'center',
  },
  controlLabel: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
});
