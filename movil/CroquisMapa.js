import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Switch } from 'react-native';
import Svg, { Rect, Circle, Text as SvgText, Path, Defs, RadialGradient, Stop, G } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SVG_VIEW_WIDTH = 800;
const SVG_VIEW_HEIGHT = 450;

export default function CroquisMapa() {
  const [invernadero, setInvernadero] = useState(1);
  const [modoVista, setModoVista] = useState('siembra'); // 'siembra' o 'calor'
  const [verRutaMonitor, setVerRutaMonitor] = useState(true);
  const [camaSeleccionada, setCamaSeleccionada] = useState(null);

  // Base de datos local de camas (Coincide con el backend FastAPI)
  const [camas, setCamas] = useState([
    // Invernadero 1 (Freedom)
    { id: 1, invernaderoId: 1, nombre: "Cama 1-1", x: 60, y: 60, w: 140, h: 45, largo: 60, ancho: 1.2, estado: "Lista Cosecha", plaga: "Araña Roja", severidad: 0.8, variedad: "Rosas Freedom", totalTallos: 150, responsable: "Luis Silva" },
    { id: 2, invernaderoId: 1, nombre: "Cama 1-2", x: 230, y: 60, w: 140, h: 45, largo: 60, ancho: 1.2, estado: "En Crecimiento", plaga: "Ninguna", severidad: 0.0, variedad: "Rosas Freedom", totalTallos: 110, responsable: "Luis Silva" },
    { id: 3, invernaderoId: 1, nombre: "Cama 1-3", x: 400, y: 60, w: 140, h: 45, largo: 60, ancho: 1.2, estado: "Sin censo", plaga: "Ninguna", severidad: 0.0, variedad: "Rosas Freedom", totalTallos: 0, responsable: "Miguel Rojas" },
    { id: 4, invernaderoId: 1, nombre: "Cama 1-4", x: 570, y: 60, w: 140, h: 45, largo: 60, ancho: 1.2, estado: "Lista Cosecha", plaga: "Trips", severidad: 0.5, variedad: "Rosas Freedom", totalTallos: 145, responsable: "Miguel Rojas" },
    { id: 5, invernaderoId: 1, nombre: "Cama 2-1", x: 60, y: 160, w: 140, h: 45, largo: 55, ancho: 1.2, estado: "En Crecimiento", plaga: "Ninguna", severidad: 0.0, variedad: "Rosas Freedom", totalTallos: 98, responsable: "Luis Silva" },
    { id: 6, invernaderoId: 1, nombre: "Cama 2-2", x: 230, y: 160, w: 140, h: 45, largo: 55, ancho: 1.2, estado: "Lista Cosecha", plaga: "Botrytis", severidad: 0.9, variedad: "Rosas Freedom", totalTallos: 160, responsable: "Luis Silva" },
    { id: 7, invernaderoId: 1, nombre: "Cama 2-3", x: 400, y: 160, w: 140, h: 45, largo: 55, ancho: 1.2, estado: "Sin censo", plaga: "Ninguna", severidad: 0.0, variedad: "Rosas Freedom", totalTallos: 0, responsable: "Miguel Rojas" },
    { id: 8, invernaderoId: 1, nombre: "Cama 2-4", x: 570, y: 160, w: 140, h: 45, largo: 55, ancho: 1.2, estado: "En Crecimiento", plaga: "Ninguna", severidad: 0.0, variedad: "Rosas Freedom", totalTallos: 105, responsable: "Miguel Rojas" },
    
    // Invernadero 2 (Explorer)
    { id: 13, invernaderoId: 2, nombre: "Cama S-1", x: 80, y: 80, w: 150, h: 50, largo: 40, ancho: 1.2, estado: "Lista Cosecha", plaga: "Araña Roja", severidad: 0.75, variedad: "Rosas Explorer", totalTallos: 120, responsable: "Ana Torres" },
    { id: 14, invernaderoId: 2, nombre: "S-2 Fila Este", x: 270, y: 80, w: 150, h: 50, largo: 40, ancho: 1.2, estado: "En Crecimiento", plaga: "Ninguna", severidad: 0.0, variedad: "Rosas Explorer", totalTallos: 85, responsable: "Ana Torres" },
    { id: 15, invernaderoId: 2, nombre: "S-3 Lateral", x: 460, y: 80, w: 150, h: 50, largo: 35, ancho: 1.1, estado: "Sin censo", plaga: "Ninguna", severidad: 0.0, variedad: "Rosas Explorer", totalTallos: 0, responsable: "Miguel Rojas" },
    { id: 16, invernaderoId: 2, nombre: "S-4 Central", x: 80, y: 200, w: 150, h: 50, largo: 40, ancho: 1.2, estado: "Lista Cosecha", plaga: "Botrytis", severidad: 0.4, variedad: "Rosas Explorer", totalTallos: 130, responsable: "Ana Torres" }
  ]);

  const camasFiltradas = camas.filter(c => c.invernaderoId === invernadero);

  return (
    <ScrollView style={styles.container}>
      {/* Cabecera / Título */}
      <View style={styles.header}>
        <Text style={styles.title}>Scouting & Mapas 2D</Text>
        <Text style={styles.subtitle}>Plano interactivo táctil compatible con Expo</Text>
      </View>

      {/* Controles de Configuración */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CONFIGURACIÓN DE VISTA</Text>
        
        {/* Selector de Invernadero */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.tabButton, invernadero === 1 && styles.tabButtonActive]}
            onPress={() => { setInvernadero(1); setCamaSeleccionada(null); }}
          >
            <Text style={[styles.tabButtonText, invernadero === 1 && styles.tabButtonTextActive]}>Galpón Norte</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, invernadero === 2 && styles.tabButtonActive]}
            onPress={() => { setInvernadero(2); setCamaSeleccionada(null); }}
          >
            <Text style={[styles.tabButtonText, invernadero === 2 && styles.tabButtonTextActive]}>Galpón Sur</Text>
          </TouchableOpacity>
        </View>

        {/* Modo de Mapa (Layout vs Heatmap) */}
        <View style={[styles.row, { marginTop: 12 }]}>
          <TouchableOpacity 
            style={[styles.toggleBtn, modoVista === 'siembra' && styles.toggleBtnActiveSiembra]}
            onPress={() => setModoVista('siembra')}
          >
            <Text style={[styles.toggleBtnText, modoVista === 'siembra' && styles.toggleBtnTextActive]}>🌱 Cultivo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, modoVista === 'calor' && styles.toggleBtnActiveCalor]}
            onPress={() => setModoVista('calor')}
          >
            <Text style={[styles.toggleBtnText, modoVista === 'calor' && styles.toggleBtnTextActive]}>🔥 Calor Plagas</Text>
          </TouchableOpacity>
        </View>

        {/* Switch Ruta Monitor */}
        <View style={[styles.switchRow, { marginTop: 12 }]}>
          <Text style={styles.switchLabel}>Mostrar Ruta Monitor (GPS)</Text>
          <Switch 
            value={verRutaMonitor}
            onValueChange={setVerRutaMonitor}
            trackColor={{ false: "#767577", true: "#06b6d4" }}
            thumbColor={verRutaMonitor ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Contenedor del Mapa SVG (Scroll Horizontal en celular) */}
      <ScrollView horizontal={true} contentContainerStyle={styles.mapScroll}>
        <View style={styles.mapContainer}>
          
          <Svg width={SVG_VIEW_WIDTH} height={SVG_VIEW_HEIGHT} viewBox={`0 0 ${SVG_VIEW_WIDTH} ${SVG_VIEW_HEIGHT}`}>
            
            {/* Gradientes Radiales de Plagas (SVG nativo en React Native) */}
            <Defs>
              {camasFiltradas.map(c => {
                const color = c.severidad > 0.7 ? "#ef4444" : c.severidad > 0.4 ? "#fbbf24" : "#10b981";
                return (
                  <RadialGradient key={`grad-${c.id}`} id={`heat-${c.id}`} cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
                    <Stop offset="40%" stopColor={color} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </RadialGradient>
                );
              })}
            </Defs>

            {/* Fondo del Mapa */}
            <Rect width={SVG_VIEW_WIDTH} height={SVG_VIEW_HEIGHT} fill="#0b0f19" />

            {/* Rejilla Blueprint */}
            {Array.from({ length: 11 }).map((_, i) => (
              <Path key={`grid-h-${i}`} d={`M 0 ${i * 45} L ${SVG_VIEW_WIDTH} ${i * 45}`} stroke="#1e293b" strokeWidth="1" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <Path key={`grid-v-${i}`} d={`M ${i * 40} 0 L ${i * 40} ${SVG_VIEW_HEIGHT}`} stroke="#1e293b" strokeWidth="1" />
            ))}

            {/* Paredes Físicas */}
            <Rect x="15" y="15" width="770" height="420" rx="12" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="8 6" />

            {/* CAPA 1: Ruta Monitor */}
            {verRutaMonitor && (
              <G>
                <Path 
                  d="M 40 120 L 760 120 L 760 220 L 40 220 L 40 320 L 760 320" 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 5" 
                  opacity="0.7"
                />
                
                {/* Puntos GPS del Monitor */}
                {[
                  {x: 100, y: 120}, {x: 350, y: 120}, {x: 650, y: 120},
                  {x: 550, y: 220}, {x: 250, y: 220},
                  {x: 180, y: 320}, {x: 480, y: 320}
                ].map((pt, i) => (
                  <Circle key={`gps-${i}`} cx={pt.x} cy={pt.y} r="4" fill="#22d3ee" />
                ))}
              </G>
            )}

            {/* CAPA 2: Camas */}
            {camasFiltradas.map(c => {
              const seleccionado = camaSeleccionada?.id === c.id;
              
              // Color base según modo
              let color = "#64748b"; // Gris
              if (modoVista === 'siembra') {
                if (c.estado === "Lista Cosecha") color = "#10b981";
                else if (c.estado === "En Crecimiento") color = "#f97316";
              } else {
                color = "#1e293b"; // Blueprint plano para el mapa de calor
              }

              return (
                <G key={c.id} onPress={() => setCamaSeleccionada(c)}>
                  {/* Cama */}
                  <Rect
                    x={c.x}
                    y={c.y}
                    width={c.w}
                    height={c.h}
                    rx="5"
                    fill={color}
                    fillOpacity={modoVista === 'siembra' ? 0.85 : 0.7}
                    stroke={seleccionado ? "#facc15" : "#334155"}
                    strokeWidth={seleccionado ? 3 : 1.5}
                  />

                  {/* Nombre Cama */}
                  <SvgText
                    x={c.x + c.w / 2}
                    y={c.y + 20}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {c.nombre}
                  </SvgText>

                  {/* Detalle inferior */}
                  <SvgText
                    x={c.x + c.w / 2}
                    y={c.y + 35}
                    fill={modoVista === 'siembra' ? "#94a3b8" : c.severidad > 0 ? "#ef4444" : "#4ade80"}
                    fontSize="8.5"
                    fontWeight={modoVista === 'calor' ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {modoVista === 'siembra' ? `${c.variedad}` : c.plaga !== 'Ninguna' ? `${c.plaga}` : 'Sana'}
                  </SvgText>

                  {/* CAPA 3: Mapa de Calor (Círculo de gradiente sobrepuesto) */}
                  {modoVista === 'calor' && c.severidad > 0 && (
                    <Circle
                      cx={c.x + c.w / 2}
                      cy={c.y + c.h / 2}
                      r={c.severidad * 80}
                      fill={`url(#heat-${c.id})`}
                      opacity={0.8}
                    />
                  )}
                </G>
              );
            })}

          </Svg>
        </View>
      </ScrollView>

      {/* Info Cama Seleccionada (Estilo Bottom Sheet) */}
      {camaSeleccionada ? (
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{camaSeleccionada.nombre}</Text>
            <View style={[styles.badge, { backgroundColor: camaSeleccionada.estado === 'Lista Cosecha' ? '#10b981' : '#f97316' }]}>
              <Text style={styles.badgeText}>{camaSeleccionada.estado}</Text>
            </View>
          </View>

          <View style={styles.sheetBody}>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Variedad:</Text>
              <Text style={styles.sheetVal}>{camaSeleccionada.variedad}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Largo Real:</Text>
              <Text style={styles.sheetVal}>{camaSeleccionada.largo} metros</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Encargado:</Text>
              <Text style={styles.sheetVal}>{camaSeleccionada.responsable}</Text>
            </View>
            <View style={styles.sheetRow}>
              <Text style={styles.sheetLabel}>Auditoría Sanitaria:</Text>
              <Text style={[styles.sheetVal, { color: camaSeleccionada.plaga !== 'Ninguna' ? '#ef4444' : '#10b981', fontWeight: 'bold' }]}>
                {camaSeleccionada.plaga !== 'Ninguna' ? `🚨 ${camaSeleccionada.plaga} (${(camaSeleccionada.severidad * 100).toFixed(0)}%)` : '🟢 Sin Plagas'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeSheetBtn} onPress={() => setCamaSeleccionada(null)}>
            <Text style={styles.closeSheetBtnText}>Cerrar Detalle</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noSelectionSheet}>
          <Text style={styles.noSelectionText}>Toca una cama en el croquis para auditarla</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tabButtonActive: {
    backgroundColor: '#2d5a27',
    borderColor: '#2d5a27',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  toggleBtnActiveSiembra: {
    backgroundColor: '#e6f4ea',
    borderWidth: 1.5,
    borderColor: '#10b981',
  },
  toggleBtnActiveCalor: {
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  toggleBtnTextActive: {
    color: '#1e293b',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  mapScroll: {
    paddingVertical: 10,
  },
  mapContainer: {
    marginHorizontal: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  sheet: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    elevation: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sheetBody: {
    gap: 8,
    marginBottom: 15,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  sheetVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  closeSheetBtn: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  closeSheetBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
  },
  noSelectionSheet: {
    margin: 15,
    padding: 25,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#94a3b8',
    alignItems: 'center',
  },
  noSelectionText: {
    fontSize: 12,
    color: '#64748b',
  }
});
