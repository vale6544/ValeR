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
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import CamaraGuiada from './CamaraGuiada';

const DEFAULT_API = Platform.OS === 'web'
  ? 'http://127.0.0.1:8000'
  : (process.env.EXPO_PUBLIC_API_URL || 'https://valer-a2bs.onrender.com');

export default function App() {
  const [activeTab, setActiveTab] = useState('captura'); // 'captura' o 'proyeccion'
  const [apiUrl, setApiUrl] = useState(DEFAULT_API);
  const [camas, setCamas] = useState([]);
  const [cargandoCamas, setCargandoCamas] = useState(false);
  const [mostrarConfigUrl, setMostrarConfigUrl] = useState(false);

  // Estados de video y cámara levantados al componente raíz
  const [videoA, setVideoA] = useState(null);
  const [videoB, setVideoB] = useState(null);
  const [ladoCamaraActivo, setLadoCamaraActivo] = useState(null);

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
        Alert.alert(
          'Error de Conexión',
          `No se pudo conectar al servidor en ${cleanApiUrl}. Por favor verifica la dirección IP del backend y que tu móvil esté conectado a la misma red.`
        );
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
          <Text style={styles.settingsBtnText}> Servidor</Text>
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
            Usa la IP de tu computadora en la red Wi-Fi (no uses localhost).
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
          />
        ) : activeTab === 'proyeccion' ? (
          <PantallaProyeccion camas={camas} apiUrl={cleanApiUrl} cargandoCamas={cargandoCamas} />
        ) : (
          <PantallaSanidad camas={camas} apiUrl={cleanApiUrl} cargandoCamas={cargandoCamas} />
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
             Cosecha
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'sanidad' && styles.tabItemActive]}
          onPress={() => setActiveTab('sanidad')}
        >
          <Text style={[styles.tabText, activeTab === 'sanidad' && styles.tabTextActive]}>
             Sanidad
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ==========================================================================
   PANTALLA 1: CAPTURA DE VIDEO CONTINUO
   ========================================================================== */
function PantallaCaptura({
  camas,
  apiUrl,
  cargandoCamas,
  videoA,
  setVideoA,
  videoB,
  setVideoB,
  setLadoCamaraActivo
}) {
  const [camaSeleccionada, setCamaSeleccionada] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [progresoMsg, setProgresoMsg] = useState('');

  const seleccionarVideo = (lado) => {
    setLadoCamaraActivo(lado);
  };

  const enviarVideos = async () => {
    if (!camaSeleccionada) {
      Alert.alert('Faltan datos', 'Por favor selecciona la cama.');
      return;
    }
    if (!videoA || !videoB) {
      Alert.alert('Faltan videos', 'Es obligatorio seleccionar el video del Lado A y Lado B.');
      return;
    }

    setProcesando(true);
    setProgresoMsg('Subiendo videos al servidor...');

    try {
      const formData = new FormData();
      formData.append('cama_id', String(camaSeleccionada));
      
      // En React Native, adjuntamos archivos locales con uri, name y type
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

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'Error al procesar el análisis continuo.');
      }

      Alert.alert(
        'Éxito!',
        `El análisis consolidado se procesó correctamente.\nTotal tallos detectados: ${resData.total_tallos}\nEtapa dominante: ${resData.etapa_dominante}`
      );
      // Limpiar formulario
      setVideoA(null);
      setVideoB(null);
    } catch (err) {
      console.error(err);
      Alert.alert('Error de Procesamiento', err.message || 'Error al conectar con el backend.');
    } finally {
      setProcesando(false);
      setProgresoMsg('');
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Censo Continuo por Cama</Text>
      <Text style={styles.subtitle}>Sube el video de ambos lados simultáneamente</Text>

      {/* Selección de Cama */}
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

      {/* Selectores de Video Lado A y B */}
      <View style={styles.card}>
        <Text style={styles.label}>Videos obligatorios de los lados:</Text>
        
        {/* Lado A */}
        <TouchableOpacity
          style={[styles.filePicker, videoA && styles.filePickerSuccess]}
          onPress={() => seleccionarVideo('A')}
        >
          <Text style={styles.filePickerEmoji}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.filePickerTitle}>Video Lado A (Cama izquierda)</Text>
            <Text style={styles.filePickerDesc} numberOfLines={1}>
              {videoA ? videoA.name : 'Ningún archivo seleccionado'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Lado B */}
        <TouchableOpacity
          style={[styles.filePicker, videoB && styles.filePickerSuccess]}
          onPress={() => seleccionarVideo('B')}
        >
          <Text style={styles.filePickerEmoji}></Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.filePickerTitle}>Video Lado B (Cama derecha)</Text>
            <Text style={styles.filePickerDesc} numberOfLines={1}>
              {videoB ? videoB.name : 'Ningún archivo seleccionado'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Botón de Procesar */}
      {procesando ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#2d5a27" />
          <Text style={styles.processingText}>{progresoMsg}</Text>
          <Text style={styles.processingHint}>El análisis con Vision AI puede tardar unos minutos.</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.submitBtn} onPress={enviarVideos}>
          <Text style={styles.submitBtnText}> Procesar Cama Completa</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ==========================================================================
   PANTALLA 2: PROYECCIÓN VS REAL COSECHA
   ========================================================================== */
function PantallaProyeccion({ camas, apiUrl, cargandoCamas }) {
  const [camaSeleccionada, setCamaSeleccionada] = useState('');
  const [proyeccionHoy, setProyeccionHoy] = useState(null);
  const [cargandoProy, setCargandoProy] = useState(false);

  // Formulario de Cosecha Real
  const [largos, setLargos] = useState('');
  const [medios, setMedios] = useState('');
  const [cortos, setCortos] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Cargar proyección de hoy de la cama seleccionada
  useEffect(() => {
    if (!camaSeleccionada) {
      setProyeccionHoy(null);
      return;
    }
    setCargandoProy(true);
    // Pedimos la proyección a 14 días para extraer el primer día (hoy)
    fetch(`${apiUrl}/reportes/proyeccion-diaria/${camaSeleccionada}?dias=14`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener proyección');
        return res.json();
      })
      .then((data) => {
        if (data.dias && data.dias.length > 0) {
          // Buscamos el elemento marcado como es_hoy
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

    const tLargos = parseInt(largos) || 0;
    const tMedios = parseInt(medios) || 0;
    const tCortos = parseInt(cortos) || 0;
    const total = tLargos + tMedios + tCortos;

    if (total === 0) {
      Alert.alert('Cosecha vacía', 'Debes registrar al menos 1 tallo cosechado.');
      return;
    }

    setGuardando(true);

    fetch(`${apiUrl}/podas/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cama_id: parseInt(camaSeleccionada),
        tallos_largos: tLargos,
        tallos_medios: tMedios,
        tallos_cortos: tCortos,
        observaciones: observaciones || null,
      }),
    })
      .then(async (res) => {
        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.detail || 'Error al registrar la cosecha.');
        }
        Alert.alert('Cosecha Registrada', `Se registraron exitosamente ${resData.total_podados} tallos.`);
        // Reset del formulario
        setLargos('');
        setMedios('');
        setCortos('');
        setObservaciones('');
      })
      .catch((err) => {
        Alert.alert('Error', err.message || 'No se pudo conectar al servidor.');
      })
      .finally(() => setGuardando(false));
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Proyecciones vs Cosecha Real</Text>
      <Text style={styles.subtitle}>Compara y registra el corte real del día</Text>

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
          <Text style={styles.projectionNote}>
            Calculado en base al último censo de visión artificial.
          </Text>
        </View>
      ) : null}

      {/* Formulario de Cosecha Real */}
      <View style={styles.card}>
        <Text style={styles.label}>Corte Real de Hoy (Tallos Cosechados):</Text>
        
        {/* Largos */}
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Largos (&gt;60cm):</Text>
          <TextInput
            style={styles.numericInput}
            value={largos}
            onChangeText={setLargos}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        {/* Medios */}
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Medios (40-60cm):</Text>
          <TextInput
            style={styles.numericInput}
            value={medios}
            onChangeText={setMedios}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        {/* Cortos */}
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Cortos (&lt;40cm):</Text>
          <TextInput
            style={styles.numericInput}
            value={cortos}
            onChangeText={setCortos}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        {/* Observaciones */}
        <View style={styles.commentContainer}>
          <Text style={styles.formLabel}>Observaciones de Cosecha:</Text>
          <TextInput
            style={styles.textArea}
            value={observaciones}
            onChangeText={setObservaciones}
            placeholder="Ej: Calidad excelente, tallos vigorosos..."
            multiline
            numberOfLines={2}
          />
        </View>
      </View>

      {/* Registrar Cosecha Button */}
      {guardando ? (
        <ActivityIndicator color="#2d5a27" style={{ marginVertical: 15 }} />
      ) : (
        <TouchableOpacity style={[styles.submitBtn, styles.saveBtn]} onPress={registrarCosecha}>
          <Text style={styles.submitBtnText}> Registrar Cosecha / Poda</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ==========================================================================
   PANTALLA 3: REPORTE DE SANIDAD Y PLAGAS
   ========================================================================== */
function PantallaSanidad({ camas, apiUrl, cargandoCamas }) {
  const [camaSeleccionada, setCamaSeleccionada] = useState('');
  const [plagaSeleccionada, setPlagaSeleccionada] = useState('');
  const [severidad, setSeveridad] = useState(''); // 'Bajo', 'Medio', 'Alto'
  const [fotoEvidencia, setFotoEvidencia] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Estados de la guía de plagas
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [cardGiradaId, setCardGiradaId] = useState(null);

  const plagasOpciones = [
    { key: 'trips', label: 'Trips (Frankliniella)' },
    { key: 'acaros', label: 'Ácaros (Arañita roja)' },
    { key: 'pulgon', label: 'Pulgón verde' },
    { key: 'minador', label: 'Minador de la hoja' },
    { key: 'botrytis', label: 'Botrytis (Moho gris)' },
    { key: 'otro', label: 'Otro / Desconocido' }
  ];

  const plagasGuia = [
    {
      id: 1,
      nombre: "Trips (Frankliniella)",
      emoji: "🪲",
      sintoma: "Insecto de tamaño diminuto que deforma los botones florales y deja listas/marcas blancas en los pétalos.",
      clima: "Peligro: 23°C - 28°C | Humedad 70% - 80%"
    },
    {
      id: 2,
      nombre: "Araña Roja (Tetranychus)",
      emoji: "🕷️",
      sintoma: "Produce punteado blanco-amarillento en las hojas y telas de araña finas en el envés. Causa defoliación severa.",
      clima: "Peligro: Altas temperaturas, sequedad y baja humedad."
    },
    {
      id: 3,
      nombre: "Pulgón Verde (Macrosiphum)",
      emoji: "🐛",
      sintoma: "Insecto verde que ataca directamente tallos jóvenes y yemas florales, dejando manchas descoloridas y hundidas.",
      clima: "Peligro: Ambientes secos sin calor extremo."
    },
    {
      id: 4,
      nombre: "Minador de la Hoja",
      emoji: "🍂",
      sintoma: "Las larvas se alimentan del tejido interno creando galerías o túneles sinuosos blancos a lo largo de las hojas.",
      clima: "Peligro: Temperaturas moderadas y brotación activa."
    },
    {
      id: 5,
      nombre: "Botrytis (Moho Gris)",
      emoji: "🍄",
      sintoma: "Produce vello y pudrición de color gris cenizo en pétalos, yemas y hojas debido a la excesiva humedad.",
      clima: "Peligro: Bajas temperaturas y humedad relativa muy alta."
    }
  ];

  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Se necesita acceso a la cámara para tomar fotos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFotoEvidencia(result.assets[0]);
      }
    } catch (err) {
      console.log('Error al capturar imagen:', err);
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  const enviarReporte = () => {
    if (!camaSeleccionada) {
      Alert.alert('Faltan datos', 'Por favor selecciona la cama.');
      return;
    }
    if (!plagaSeleccionada) {
      Alert.alert('Faltan datos', 'Por favor selecciona el tipo de plaga/enfermedad.');
      return;
    }
    if (!severidad) {
      Alert.alert('Faltan datos', 'Por favor selecciona el nivel de severidad.');
      return;
    }

    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      Alert.alert('Reporte Enviado', 'El reporte de sanidad ha sido notificado al supervisor.');
      setCamaSeleccionada('');
      setPlagaSeleccionada('');
      setSeveridad('');
      setFotoEvidencia(null);
      setObservaciones('');
    }, 1500);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Reporte de Sanidad / Plagas</Text>
        <Text style={styles.subtitle}>Reporta focos de plagas o enfermedades en campo</Text>

        {/* Seleccionar Cama */}
        <Text style={styles.label}>Cama Afectada:</Text>
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

        {/* Seleccionar Plaga */}
        <Text style={[styles.label, { marginTop: 16 }]}>Tipo de Plaga / Enfermedad:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
          {plagasOpciones.map((op) => (
            <TouchableOpacity
              key={op.key}
              style={[
                styles.camaChip,
                plagaSeleccionada === op.key && [styles.camaChipSelected, { backgroundColor: '#991b1b', borderColor: '#7f1d1d' }]
              ]}
              onPress={() => setPlagaSeleccionada(op.key)}
            >
              <Text
                style={[
                  styles.camaChipText,
                  plagaSeleccionada === op.key && { color: 'white' }
                ]}
              >
                {op.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seleccionar Severidad */}
        <Text style={[styles.label, { marginTop: 16 }]}>Nivel de Severidad:</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 6 }}>
          <TouchableOpacity
            style={[
              { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', borderColor: '#f59e0b', backgroundColor: '#fef3c7' },
              severidad === 'Bajo' && { borderWidth: 3 }
            ]}
            onPress={() => setSeveridad('Bajo')}
          >
            <Text style={{ fontWeight: '700', color: '#b45309', fontSize: 13 }}>Bajo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', borderColor: '#f97316', backgroundColor: '#ffedd5' },
              severidad === 'Medio' && { borderWidth: 3 }
            ]}
            onPress={() => setSeveridad('Medio')}
          >
            <Text style={{ fontWeight: '700', color: '#c2410c', fontSize: 13 }}>Medio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', borderColor: '#ef4444', backgroundColor: '#fee2e2' },
              severidad === 'Alto' && { borderWidth: 3 }
            ]}
            onPress={() => setSeveridad('Alto')}
          >
            <Text style={{ fontWeight: '700', color: '#991b1b', fontSize: 13 }}>Alto</Text>
          </TouchableOpacity>
        </View>

        {/* Fotografía de Evidencia */}
        <Text style={[styles.label, { marginTop: 16 }]}>Fotografía de Evidencia:</Text>
        <TouchableOpacity
          style={[styles.filePicker, fotoEvidencia && styles.filePickerSuccess]}
          onPress={tomarFoto}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.filePickerTitle}>Tomar Foto / Cámara del dispositivo</Text>
            <Text style={styles.filePickerDesc} numberOfLines={1}>
              {fotoEvidencia ? 'Foto capturada con éxito' : 'Ninguna imagen capturada'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Observaciones */}
        <View style={styles.commentContainer}>
          <Text style={styles.label}>Observaciones / Síntomas:</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Describe detalladamente el daño observado..."
            value={observaciones}
            onChangeText={setObservaciones}
          />
        </View>
      </View>

      {/* Botón de Enviar */}
      {enviando ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#991b1b" />
          <Text style={[styles.processingText, { color: '#991b1b' }]}>Enviando reporte de sanidad...</Text>
        </View>
      ) : (
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#991b1b' }]} onPress={enviarReporte}>
          <Text style={styles.submitBtnText}>Emitir Reporte</Text>
        </TouchableOpacity>
      )}

      {/* Botón Flotante de Sanidad (FAB) */}
      <TouchableOpacity 
        style={styles.fabBtn} 
        onPress={() => {
          setMostrarGuia(true);
          setCardGiradaId(null);
        }}
      >
        <Text style={styles.fabBtnText}>?</Text>
      </TouchableOpacity>

      {/* Modal Desplegable de Fichas de Sanidad */}
      <Modal
        visible={mostrarGuia}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMostrarGuia(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setMostrarGuia(false)}
          />
          <View style={styles.modalDrawer}>
            {/* Header del Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Guía de Identificación</Text>
              <TouchableOpacity onPress={() => setMostrarGuia(false)}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>

            {/* Listado de Plagas */}
            <ScrollView contentContainerStyle={styles.modalList} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalHint}>
                Toca cualquier tarjeta para ver los síntomas y condiciones climáticas de riesgo.
              </Text>

              {plagasGuia.map((plaga) => {
                const isFlipped = cardGiradaId === plaga.id;
                return (
                  <TouchableOpacity
                    key={plaga.id}
                    activeOpacity={0.9}
                    onPress={() => setCardGiradaId(isFlipped ? null : plaga.id)}
                    style={[
                      styles.guiaCard,
                      isFlipped ? styles.guiaCardBack : styles.guiaCardFront
                    ]}
                  >
                    {isFlipped ? (
                      <View style={styles.cardContentContainer}>
                        <Text style={styles.cardBackTitle}>{plaga.nombre}</Text>
                        <Text style={styles.cardBackSub}>Síntomas:</Text>
                        <Text style={styles.cardBackText}>{plaga.sintoma}</Text>
                        <View style={styles.climaBox}>
                          <Text style={styles.climaText}>{plaga.clima}</Text>
                        </View>
                        <Text style={styles.cardFlipHintBack}>Toca para regresar ⟳</Text>
                      </View>
                    ) : (
                      <View style={styles.cardContentContainerCenter}>
                        <Text style={styles.cardFrontEmoji}>{plaga.emoji}</Text>
                        <Text style={styles.cardFrontTitle}>{plaga.nombre}</Text>
                        <Text style={styles.cardFlipHint}>Toca para ver síntomas ⟳</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f4',
  },
  header: {
    height: 56,
    backgroundColor: '#2d5a27',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  settingsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  settingsBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  configBox: {
    padding: 16,
    backgroundColor: '#e5f0e4',
    borderBottomWidth: 1,
    borderBottomColor: '#cbdcd1',
  },
  configLabel: {
    fontSize: 13,
    color: '#1a3d16',
    fontWeight: '600',
    marginBottom: 6,
  },
  configInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  configInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#b2cbb1',
    fontSize: 14,
  },
  reconnectBtn: {
    backgroundColor: '#2d5a27',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  reconnectBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  configHint: {
    fontSize: 11,
    color: '#5b7659',
    marginTop: 6,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  screen: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a2e1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d5a27',
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  camaChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f1',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2eae2',
  },
  camaChipSelected: {
    backgroundColor: '#2d5a27',
    borderColor: '#2d5a27',
  },
  camaChipText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '600',
  },
  camaChipTextSelected: {
    color: 'white',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fafafa',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    marginBottom: 12,
  },
  filePickerSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
    borderStyle: 'solid',
  },
  filePickerEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  filePickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  filePickerDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  submitBtn: {
    height: 48,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtn: {
    backgroundColor: '#2d5a27',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#2d5a27',
  },
  processingHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  projectionCard: {
    backgroundColor: '#e6f4ea',
    borderLeftWidth: 5,
    borderLeftColor: '#34a853',
  },
  projectionLabel: {
    fontSize: 13,
    color: '#137333',
    fontWeight: '600',
  },
  projectionValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#137333',
    marginVertical: 4,
  },
  projectionNote: {
    fontSize: 11,
    color: '#137333',
    opacity: 0.8,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  formLabel: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
  },
  numericInput: {
    width: 80,
    height: 38,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  commentContainer: {
    marginTop: 12,
  },
  textArea: {
    marginTop: 6,
    height: 60,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: 'white',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    borderTopWidth: 3,
    borderTopColor: '#2d5a27',
  },
  tabText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2d5a27',
    fontWeight: '700',
  },
  fabBtn: {
    position: 'absolute',
    bottom: 75,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 9999,
  },
  fabBtnText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalDrawer: {
    backgroundColor: '#f4f6f4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#aac9a0',
    paddingBottom: 12,
    marginBottom: 15,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  modalList: {
    paddingBottom: 30,
  },
  modalHint: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 15,
    textAlign: 'center',
  },
  guiaCard: {
    width: '100%',
    minHeight: 150,
    borderRadius: 12,
    marginBottom: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guiaCardFront: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#aac9a0',
  },
  guiaCardBack: {
    backgroundColor: '#2d5a27',
  },
  cardContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardContentContainerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFrontEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardFrontTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    textAlign: 'center',
  },
  cardBackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardBackSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a7f3d0',
    marginBottom: 4,
  },
  cardBackText: {
    fontSize: 13,
    color: 'white',
    lineHeight: 18,
    marginBottom: 10,
  },
  climaBox: {
    backgroundColor: '#1e3f1a',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  climaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a7f3d0',
    textAlign: 'center',
  },
  cardFlipHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
  },
  cardFlipHintBack: {
    fontSize: 11,
    color: '#a7f3d0',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.8,
  },
});
