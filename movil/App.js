import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
  Platform,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import CamaraGuiada from './CamaraGuiada';

const DEFAULT_API = Platform.OS === 'web'
  ? 'http://127.0.0.1:8000'
  : (process.env.EXPO_PUBLIC_API_URL || 'https://valer-a2bs.onrender.com');

const OFFLINE_STORAGE_KEY = '@rosas_monitor_cola_offline_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState('captura'); // 'captura', 'proyeccion', 'cola_offline'
  const [apiUrl, setApiUrl] = useState(DEFAULT_API);
  const [camas, setCamas] = useState([]);
  const [cargandoCamas, setCargandoCamas] = useState(false);
  const [mostrarConfigUrl, setMostrarConfigUrl] = useState(false);

  // Estados de video y cámara levantados al componente raíz
  const [videoA, setVideoA] = useState(null);
  const [videoB, setVideoB] = useState(null);
  const [ladoCamaraActivo, setLadoCamaraActivo] = useState(null);

  // Cola de Videos Pendientes (Offline) persistida localmente con AsyncStorage
  const [colaOffline, setColaOffline] = useState([]);

  // Cargar cola offline guardada del almacenamiento local al iniciar
  useEffect(() => {
    AsyncStorage.getItem(OFFLINE_STORAGE_KEY)
      .then((json) => {
        if (json) {
          try {
            const data = JSON.parse(json);
            if (Array.isArray(data)) {
              setColaOffline(data);
            }
          } catch (e) {
            console.error("Error parseando cola offline:", e);
          }
        }
      })
      .catch((err) => console.error("Error cargando cola offline:", err));
  }, []);

  // Obtener URL limpia sin slashes al final
  const cleanApiUrl = apiUrl ? apiUrl.replace(/\/+$/, '') : '';

  // Carga de camas al iniciar o cambiar la URL del API
  const cargarCamas = () => {
    setCargandoCamas(true);
    fetch(`${cleanApiUrl}/camas/`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener camas');
        return res.json();
      })
      .then((data) => {
        setCamas(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setCargandoCamas(false));
  };

  useEffect(() => {
    cargarCamas();
  }, [apiUrl]);

  if (ladoCamaraActivo) {
    return (
      <CamaraGuiada
        onCancel={() => setLadoCamaraActivo(null)}
        onVideoSelected={(file) => {
          if (ladoCamaraActivo === 'A') {
            setVideoA(file);
          } else {
            setVideoB(file);
          }
          setLadoCamaraActivo(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d5a27" />
      
      {/* Header de la Aplicación */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rosas Monitor - Operador</Text>
        <TouchableOpacity
          onPress={() => setMostrarConfigUrl(!mostrarConfigUrl)}
          style={styles.settingsBtn}
        >
          <Text style={styles.settingsBtnText}>
            {mostrarConfigUrl ? 'Ocultar IP' : 'Servidor'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Caja de configuración de IP del servidor */}
      {mostrarConfigUrl && (
        <View style={styles.configBox}>
          <Text style={styles.configLabel}>IP Servidor Backend (FastAPI):</Text>
          <View style={styles.configInputRow}>
            <TextInput
              style={styles.configInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="Ej: http://192.168.137.1:8000"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={cargarCamas} style={styles.reconnectBtn}>
              <Text style={styles.reconnectBtnText}>Probar</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.configHint}>
            Usa la URL de Render o IP local de tu servidor backend.
          </Text>
        </View>
      )}

      {/* Contenido Principal */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'captura' ? (
          <PantallaCaptura
            camas={camas}
            apiUrl={cleanApiUrl}
            cargandoCamas={cargandoCamas}
            videoA={videoA}
            setVideoA={setVideoA}
            videoB={videoB}
            setVideoB={setVideoB}
            setLadoCamaraActivo={setLadoCamaraActivo}
            colaOffline={colaOffline}
            setColaOffline={(fnOrVal) => {
              setColaOffline((prev) => {
                const nueva = typeof fnOrVal === 'function' ? fnOrVal(prev) : fnOrVal;
                AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(nueva)).catch(err => console.error("Error guardando:", err));
                return nueva;
              });
            }}
          />
        ) : activeTab === 'proyeccion' ? (
          <PantallaProyeccion camas={camas} apiUrl={cleanApiUrl} cargandoCamas={cargandoCamas} />
        ) : (
          <PantallaColaOffline
            colaOffline={colaOffline}
            setColaOffline={(fnOrVal) => {
              setColaOffline((prev) => {
                const nueva = typeof fnOrVal === 'function' ? fnOrVal(prev) : fnOrVal;
                AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(nueva)).catch(err => console.error("Error guardando:", err));
                return nueva;
              });
            }}
            apiUrl={cleanApiUrl}
          />
        )}
      </ScrollView>

      {/* Barra de Navegación Inferior (Tabs) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'captura' && styles.tabItemActive]}
          onPress={() => setActiveTab('captura')}
        >
          <Text style={[styles.tabText, activeTab === 'captura' && styles.tabTextActive]}>
            Captura Cama
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'proyeccion' && styles.tabItemActive]}
          onPress={() => setActiveTab('proyeccion')}
        >
          <Text style={[styles.tabText, activeTab === 'proyeccion' && styles.tabTextActive]}>
            Cosecha & Poda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'cola_offline' && styles.tabItemActive]}
          onPress={() => setActiveTab('cola_offline')}
        >
          <Text style={[styles.tabText, activeTab === 'cola_offline' && styles.tabTextActive]}>
            Pendientes ({colaOffline.length})
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ==========================================================================
   PANTALLA 1: CAPTURA DE VIDEO Y ENVÍO ASÍNCRONO (FIRE & FORGET) / OFFLINE
   ========================================================================== */
function PantallaCaptura({
  camas,
  apiUrl,
  cargandoCamas,
  videoA,
  setVideoA,
  videoB,
  setVideoB,
  setLadoCamaraActivo,
  colaOffline,
  setColaOffline
}) {
  const [camaSeleccionada, setCamaSeleccionada] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [progresoMsg, setProgresoMsg] = useState('');

  const abrirGaleriaDirecta = async (lado) => {
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
          const fileObj = {
            uri: permanentUri,
            name: fileName,
            mimeType: file.mimeType || 'video/mp4',
          };
          if (lado === 'A') setVideoA(fileObj);
          else setVideoB(fileObj);
        } catch (e) {
          const fileObj = {
            uri: file.uri,
            name: fileName,
            mimeType: file.mimeType || 'video/mp4',
          };
          if (lado === 'A') setVideoA(fileObj);
          else setVideoB(fileObj);
        }
      }
    } catch (error) {
      console.error("Error abriendo galeria:", error);
      Alert.alert("Error", "No se pudo acceder a la galería de videos.");
    }
  };

  const seleccionarVideo = (lado) => {
    setLadoCamaraActivo(lado);
  };

  // Enviar video al servidor de forma ASÍNCRONA sin esperar el procesamiento de IA
  const enviarVideosServidor = async () => {
    if (!camaSeleccionada) {
      Alert.alert('Faltan datos', 'Por favor selecciona la cama.');
      return;
    }
    if (!videoA || !videoB) {
      Alert.alert('Faltan videos', 'Es obligatorio seleccionar el video del Lado A y Lado B.');
      return;
    }

    setProcesando(true);
    setProgresoMsg('Enviando video al servidor...');

    try {
      const formData = new FormData();
      formData.append('cama_id', String(camaSeleccionada));
      
      formData.append('video_a', {
        uri: videoA.uri,
        name: videoA.name || 'video_lado_a.mp4',
        type: videoA.mimeType || 'video/mp4',
      });

      formData.append('video_b', {
        uri: videoB.uri,
        name: videoB.name || 'video_lado_b.mp4',
        type: videoB.mimeType || 'video/mp4',
      });

      const response = await fetch(`${apiUrl}/registros/cargar-cama-completa/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor.');
      }

      Alert.alert(
        'Video Enviado con Éxito',
        'El video de la cama fue recibido por el servidor. El procesamiento de IA se realizará en segundo plano y podrás consultar los resultados en la plataforma Web.'
      );

      // Limpiar selección para la siguiente captura
      setVideoA(null);
      setVideoB(null);

    } catch (err) {
      console.error("Error al enviar video:", err);
      Alert.alert(
        'Sin Conexión / Error de Subida',
        'No se pudo conectar con el servidor. ¿Deseas guardar este video localmente en la cola offline con fecha y hora?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Guardar en Offline', onPress: guardarOffline }
        ]
      );
    } finally {
      setProcesando(false);
      setProgresoMsg('');
    }
  };

  // Guardar video localmente en la cola offline con Fecha y Hora
  const guardarOffline = () => {
    if (!camaSeleccionada) {
      Alert.alert('Faltan datos', 'Por favor selecciona la cama.');
      return;
    }
    if (!videoA || !videoB) {
      Alert.alert('Faltan videos', 'Es obligatorio seleccionar el video del Lado A y Lado B.');
      return;
    }

    const camaObj = camas.find(c => String(c.id) === String(camaSeleccionada));
    const camaNombre = camaObj ? camaObj.nombre : `Cama ${camaSeleccionada}`;
    const fechaHora = new Date().toLocaleString();

    const nuevoRegistroOffline = {
      id: Date.now().toString(),
      cama_id: camaSeleccionada,
      cama_nombre: camaNombre,
      fecha_hora: fechaHora,
      videoA,
      videoB
    };

    setColaOffline(prev => [nuevoRegistroOffline, ...prev]);

    Alert.alert(
      'Guardado Offline Exitoso',
      `El video de ${camaNombre} quedó guardado en el dispositivo con la fecha/hora (${fechaHora}). Podrás enviarlo al servidor cuando recuperes internet.`
    );

    setVideoA(null);
    setVideoB(null);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Captura de Cama (Video Guiado)</Text>
      <Text style={styles.subtitle}>Escanea ambos lados de la cama para el conteo continuo por IA</Text>

      {/* Selector de Cama */}
      <View style={styles.card}>
        <Text style={styles.label}>1. Selecciona la Cama a Escanear:</Text>
        {cargandoCamas ? (
          <ActivityIndicator color="#2d5a27" style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.pickerContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              {camas.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.camaChip,
                    camaSeleccionada === c.id && styles.camaChipSelected,
                  ]}
                  onPress={() => setCamaSeleccionada(c.id)}
                >
                  <Text
                    style={[
                      styles.camaChipText,
                      camaSeleccionada === c.id && styles.camaChipTextSelected,
                    ]}
                  >
                    {c.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Botones de Captura de Video Lado A y Lado B */}
      <View style={styles.card}>
        <Text style={styles.label}>2. Grabar o Cargar Videos por Lado:</Text>

        {/* Lado A */}
        <TouchableOpacity
          style={[styles.filePicker, videoA && styles.filePickerSuccess]}
          onPress={() => seleccionarVideo('A')}
        >
          <Text style={styles.filePickerTitle}>
            {videoA ? '[PREPARADO] Video Lado A' : 'Video Lado A (Cama izquierda)'}
          </Text>
          <Text style={styles.filePickerDesc}>
            {videoA ? videoA.name : 'Toca para grabar video guiado o seleccionar de galería'}
          </Text>
        </TouchableOpacity>

        {/* Lado B */}
        <TouchableOpacity
          style={[styles.filePicker, videoB && styles.filePickerSuccess]}
          onPress={() => seleccionarVideo('B')}
        >
          <Text style={styles.filePickerTitle}>
            {videoB ? '[PREPARADO] Video Lado B' : 'Video Lado B (Cama derecha)'}
          </Text>
          <Text style={styles.filePickerDesc}>
            {videoB ? videoB.name : 'Toca para grabar video guiado o seleccionar de galería'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botones de Acción: Enviar al Servidor / Guardar Offline */}
      {procesando ? (
        <View style={[styles.card, styles.processingContainer]}>
          <ActivityIndicator size="large" color="#2d5a27" />
          <Text style={styles.processingText}>{progresoMsg}</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            style={[styles.submitBtn, (!videoA || !videoB || !camaSeleccionada) && { opacity: 0.6 }]}
            onPress={enviarVideosServidor}
          >
            <Text style={styles.submitBtnText}>Enviar Video al Servidor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: '#718096' }]}
            onPress={guardarOffline}
          >
            <Text style={styles.submitBtnText}>Guardar para envío posterior (Offline)</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* ==========================================================================
   PANTALLA 2: REGISTRO SEPARADO DE COSECHA Y PODA TÉCNICA
   ========================================================================== */
function PantallaProyeccion({ camas, apiUrl, cargandoCamas }) {
  const [camaSeleccionada, setCamaSeleccionada] = useState('');
  const [proyeccionHoy, setProyeccionHoy] = useState(null);
  const [cargandoProy, setCargandoProy] = useState(false);

  const [tallos, setTallos] = useState('');
  const [guardandoCosecha, setGuardandoCosecha] = useState(false);

  const [hizoPoda, setHizoPoda] = useState(true);
  const [guardandoPoda, setGuardandoPoda] = useState(false);

  useEffect(() => {
    if (!camaSeleccionada) {
      setProyeccionHoy(null);
      return;
    }
    setCargandoProy(true);
    fetch(`${apiUrl}/reportes/proyeccion-diaria/${camaSeleccionada}?dias=14`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener proyección');
        return res.json();
      })
      .then((data) => {
        if (data.dias && data.dias.length > 0) {
          const hoy = data.dias.find((d) => d.es_hoy) || data.dias[0];
          setProyeccionHoy(hoy ? hoy.botones_proyectados : 0);
        } else {
          setProyeccionHoy(0);
        }
      })
      .catch((err) => {
        console.warn(err);
        setProyeccionHoy(0);
      })
      .finally(() => setCargandoProy(false));
  }, [camaSeleccionada]);

  const registrarCosecha = () => {
    if (!camaSeleccionada) {
      Alert.alert('Faltan datos', 'Por favor selecciona la cama.');
      return;
    }

    const totalTallos = parseInt(tallos) || 0;
    if (totalTallos === 0) {
      Alert.alert('Cosecha vacía', 'Debes ingresar el número de tallos cosechados.');
      return;
    }

    setGuardandoCosecha(true);
    fetch(`${apiUrl}/podas/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cama_id: parseInt(camaSeleccionada),
        tallos_largos: totalTallos,
        tallos_medios: 0,
        tallos_cortos: 0,
        observaciones: `Cosecha Diaria: ${totalTallos} tallos.`,
      }),
    })
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.detail || 'Error al registrar la cosecha.');
        Alert.alert('Cosecha Registrada', `Se registraron exitosamente ${totalTallos} tallos cosechados.`);
        setTallos('');
      })
      .catch((err) => {
        Alert.alert('Error', err.message || 'No se pudo conectar al servidor.');
      })
      .finally(() => setGuardandoCosecha(false));
  };

  const registrarPoda = () => {
    if (!camaSeleccionada) {
      Alert.alert('Faltan datos', 'Por favor selecciona la cama.');
      return;
    }

    setGuardandoPoda(true);
    fetch(`${apiUrl}/podas/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cama_id: parseInt(camaSeleccionada),
        tallos_largos: 0,
        tallos_medios: 0,
        tallos_cortos: 0,
        observaciones: `Poda Técnica: ${hizoPoda ? 'SÍ' : 'NO'}.`,
      }),
    })
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.detail || 'Error al registrar la poda.');
        Alert.alert('Poda Registrada', `Se registró la poda técnica como: ${hizoPoda ? 'SÍ' : 'NO'}.`);
      })
      .catch((err) => {
        Alert.alert('Error', err.message || 'No se pudo conectar al servidor.');
      })
      .finally(() => setGuardandoPoda(false));
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Cosecha & Poda Técnica</Text>
      <Text style={styles.subtitle}>Compara la proyección y registra el corte real</Text>

      {/* Selector de Cama */}
      <View style={styles.card}>
        <Text style={styles.label}>Selecciona la Cama:</Text>
        {cargandoCamas ? (
          <ActivityIndicator color="#2d5a27" style={{ marginVertical: 10 }} />
        ) : (
          <View style={styles.pickerContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              {camas.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.camaChip,
                    camaSeleccionada === c.id && styles.camaChipSelected,
                  ]}
                  onPress={() => setCamaSeleccionada(c.id)}
                >
                  <Text
                    style={[
                      styles.camaChipText,
                      camaSeleccionada === c.id && styles.camaChipTextSelected,
                    ]}
                  >
                    {c.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bloque de Proyección de Hoy */}
      {camaSeleccionada ? (
        <View style={[styles.card, styles.projectionCard]}>
          <Text style={styles.projectionLabel}>Proyección de Cosecha para Hoy:</Text>
          {cargandoProy ? (
            <ActivityIndicator color="#1a3d16" style={{ marginVertical: 8 }} />
          ) : (
            <Text style={styles.projectionValue}>
              {proyeccionHoy !== null ? `${proyeccionHoy} rosas` : 'Sin datos'}
            </Text>
          )}
        </View>
      ) : null}

      {/* FORMULARIO 1: REGISTRO DE TALLOS COSECHADOS */}
      <View style={styles.card}>
        <Text style={styles.label}>Registro de Tallos Cosechados:</Text>
        
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Total Tallos:</Text>
          <TextInput
            style={styles.numericInput}
            value={tallos}
            onChangeText={setTallos}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        {guardandoCosecha ? (
          <ActivityIndicator color="#2d5a27" style={{ marginVertical: 10 }} />
        ) : (
          <TouchableOpacity style={[styles.submitBtn, { marginTop: 12 }]} onPress={registrarCosecha}>
            <Text style={styles.submitBtnText}>Confirmar Cosecha</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* FORMULARIO 2: REGISTRO DE PODA TÉCNICA */}
      <View style={styles.card}>
        <Text style={styles.label}>Control de Poda Técnica:</Text>
        
        <View style={[styles.formRow, { alignItems: 'center', marginVertical: 6 }]}>
          <Text style={styles.formLabel}>¿Se realizó Poda Técnica hoy?</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[
                styles.camaChip,
                hizoPoda && styles.camaChipSelected,
                { paddingHorizontal: 20, paddingVertical: 8 }
              ]}
              onPress={() => setHizoPoda(true)}
            >
              <Text style={[styles.camaChipText, hizoPoda && styles.camaChipTextSelected]}>Sí</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.camaChip,
                !hizoPoda && styles.camaChipSelected,
                { paddingHorizontal: 20, paddingVertical: 8 }
              ]}
              onPress={() => setHizoPoda(false)}
            >
              <Text style={[styles.camaChipText, !hizoPoda && styles.camaChipTextSelected]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {guardandoPoda ? (
          <ActivityIndicator color="#2d5a27" style={{ marginVertical: 10 }} />
        ) : (
          <TouchableOpacity style={[styles.submitBtn, { marginTop: 12, backgroundColor: '#166534' }]} onPress={registrarPoda}>
            <Text style={styles.submitBtnText}>Confirmar Poda Técnica</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

/* ==========================================================================
   PANTALLA 3: COLA DE VIDEOS PENDIENTES (OFFLINE)
   ========================================================================== */
function PantallaColaOffline({ colaOffline, setColaOffline, apiUrl }) {
  const [enviandoId, setEnviandoId] = useState(null);

  const procesarEnvioItem = async (item) => {
    setEnviandoId(item.id);

    try {
      const formData = new FormData();
      formData.append('cama_id', String(item.cama_id));
      
      formData.append('video_a', {
        uri: item.videoA.uri,
        name: item.videoA.name || 'video_lado_a.mp4',
        type: item.videoA.mimeType || 'video/mp4',
      });

      formData.append('video_b', {
        uri: item.videoB.uri,
        name: item.videoB.name || 'video_lado_b.mp4',
        type: item.videoB.mimeType || 'video/mp4',
      });

      const response = await fetch(`${apiUrl}/registros/cargar-cama-completa/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor.');
      }

      Alert.alert(
        'Video Enviado con Éxito',
        `El video de ${item.cama_nombre} grabado el ${item.fecha_hora} fue subido al servidor. Los resultados se procesarán para la Web.`
      );

      // Limpiar archivos locales en almacenamiento interno tras envío exitoso
      if (item.videoA?.uri && item.videoA.uri.startsWith(FileSystem.documentDirectory)) {
        FileSystem.deleteAsync(item.videoA.uri, { idempotent: true }).catch(() => {});
      }
      if (item.videoB?.uri && item.videoB.uri.startsWith(FileSystem.documentDirectory)) {
        FileSystem.deleteAsync(item.videoB.uri, { idempotent: true }).catch(() => {});
      }

      // Eliminar de la cola tras envío exitoso
      setColaOffline(prev => prev.filter(i => i.id !== item.id));

    } catch (err) {
      Alert.alert('Error de Envío', 'Asegúrate de estar conectado a Internet para procesar el video.');
    } finally {
      setEnviandoId(null);
    }
  };

  const eliminarItemOffline = (item) => {
    if (item.videoA?.uri && item.videoA.uri.startsWith(FileSystem.documentDirectory)) {
      FileSystem.deleteAsync(item.videoA.uri, { idempotent: true }).catch(() => {});
    }
    if (item.videoB?.uri && item.videoB.uri.startsWith(FileSystem.documentDirectory)) {
      FileSystem.deleteAsync(item.videoB.uri, { idempotent: true }).catch(() => {});
    }
    setColaOffline(prev => prev.filter(i => i.id !== item.id));
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Videos Pendientes (Cola Offline)</Text>
      <Text style={styles.subtitle}>Videos guardados localmente en el dispositivo con fecha y hora</Text>

      {colaOffline.length === 0 ? (
        <View style={styles.card}>
          <Text style={{ textAlign: 'center', color: '#718096', marginVertical: 20 }}>
            No tienes videos offline pendientes por enviar.
          </Text>
        </View>
      ) : (
        colaOffline.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2d5a27' }}>
              {item.cama_nombre}
            </Text>
            <Text style={{ fontSize: 12, color: '#718096', marginVertical: 4 }}>
              Fecha y Hora de Grabación: {item.fecha_hora}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                disabled={enviandoId === item.id}
                style={[styles.submitBtn, { flex: 1 }]}
                onPress={() => procesarEnvioItem(item)}
              >
                {enviandoId === item.id ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitBtnText}>Enviar a Procesar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#e53e3e', width: 90 }]}
                onPress={() => eliminarItemOffline(item)}
              >
                <Text style={styles.submitBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

/* ==========================================================================
   ESTILOS
   ========================================================================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f5',
  },
  header: {
    backgroundColor: '#2d5a27',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  settingsBtn: {
    padding: 6,
  },
  settingsBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  configBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  configLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 4,
  },
  configInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  configInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  reconnectBtn: {
    backgroundColor: '#2d5a27',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 6,
  },
  reconnectBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  configHint: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  screen: {
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3d16',
  },
  subtitle: {
    fontSize: 13,
    color: '#4a5568',
    marginTop: -8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d5a27',
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  camaChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#edf2f7',
    marginRight: 8,
  },
  camaChipSelected: {
    backgroundColor: '#2d5a27',
  },
  camaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a5568',
  },
  camaChipTextSelected: {
    color: '#ffffff',
  },
  filePicker: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  filePickerSuccess: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
  },
  filePickerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d3748',
  },
  filePickerDesc: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#2d5a27',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5a27',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
  },
  numericInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: 'bold',
    width: 90,
    textAlign: 'center',
  },
  projectionCard: {
    backgroundColor: '#f0fff4',
    borderColor: '#c6f6d5',
    borderWidth: 1,
  },
  projectionLabel: {
    fontSize: 13,
    color: '#22543d',
    fontWeight: '600',
  },
  projectionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#276749',
    marginVertical: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabItemActive: {
    borderTopWidth: 3,
    borderTopColor: '#2d5a27',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
  },
  tabTextActive: {
    color: '#2d5a27',
    fontWeight: 'bold',
  },
});
