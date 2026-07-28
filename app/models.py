from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta, timezone
from app.database import Base


def obtener_hora_ecuador():
    # Ecuador es GMT-5 sin horario de verano
    tz = timezone(timedelta(hours=-5))
    return datetime.now(tz).replace(tzinfo=None)


class Cama(Base):
    __tablename__ = "camas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    variedad = Column(String(100), nullable=True)
    filas_por_cama = Column(Integer, default=1)
    largo = Column(Float, nullable=True)
    ancho = Column(Float, nullable=True)
    responsable = Column(String(150), nullable=True)
    fecha_creacion = Column(DateTime, default=obtener_hora_ecuador)

    registros = relationship("Registro", back_populates="cama")
    segmentos = relationship("Segmento", back_populates="cama")


class Registro(Base):
    __tablename__ = "registros"

    id = Column(Integer, primary_key=True, index=True)
    cama_id = Column(Integer, ForeignKey("camas.id"), nullable=False)
    fecha = Column(DateTime, default=obtener_hora_ecuador)
    ruta_imagen = Column(String(500), nullable=False)
    segmento = Column(String(50), nullable=True)
    lado = Column(String(1), nullable=True)
    observaciones = Column(Text, nullable=True)

    cama = relationship("Cama", back_populates="registros")
    metricas = relationship("Metrica", back_populates="registro", uselist=False)


class Metrica(Base):
    __tablename__ = "metricas"

    id = Column(Integer, primary_key=True, index=True)
    registro_id = Column(Integer, ForeignKey("registros.id"), nullable=False)

    # Clasificación por altura de tallos
    etapa_crecimiento = Column(String(50), nullable=True)
    tallos_cortos = Column(Integer, default=0)
    tallos_medios = Column(Integer, default=0)
    tallos_largos = Column(Integer, default=0)
    total_tallos = Column(Integer, default=0)
    score_confianza = Column(Float, nullable=True)

    # Clasificación por tamaño de botón
    boton_arroz = Column(Integer, default=0)
    boton_alberja = Column(Integer, default=0)
    boton_garbanzo = Column(Integer, default=0)
    boton_rayando_color = Column(Integer, default=0)
    boton_estrella = Column(Integer, default=0)
    boton_cosecha = Column(Integer, default=0)
    etapa_dominante = Column(String(50), nullable=True)
    total_botones = Column(Integer, default=0)
    matriz_botones_tallos = Column(Text, nullable=True)  # JSON string

# Detección combinada tallo + botón
    tallo_largo_cosecha  = Column(Integer, default=0)
    tallo_largo_estrella = Column(Integer, default=0)
    tallo_largo_rayando  = Column(Integer, default=0)
    tallo_largo_garbanzo = Column(Integer, default=0)
    tallo_largo_alberja  = Column(Integer, default=0)
    tallo_largo_arroz    = Column(Integer, default=0)
    tallo_largo_sin_boton = Column(Integer, default=0)

    tallo_medio_cosecha  = Column(Integer, default=0)
    tallo_medio_estrella = Column(Integer, default=0)
    tallo_medio_rayando  = Column(Integer, default=0)
    tallo_medio_garbanzo = Column(Integer, default=0)
    tallo_medio_alberja  = Column(Integer, default=0)
    tallo_medio_arroz    = Column(Integer, default=0)
    tallo_medio_sin_boton = Column(Integer, default=0)

    tallo_corto_cosecha  = Column(Integer, default=0)
    tallo_corto_estrella = Column(Integer, default=0)
    tallo_corto_rayando  = Column(Integer, default=0)
    tallo_corto_garbanzo = Column(Integer, default=0)
    tallo_corto_alberja  = Column(Integer, default=0)
    tallo_corto_arroz    = Column(Integer, default=0)
    tallo_corto_sin_boton = Column(Integer, default=0)

    detalle_tallos_json  = Column(Text, nullable=True)

    fecha_analisis = Column(DateTime, default=obtener_hora_ecuador)

    registro = relationship("Registro", back_populates="metricas")


class Poda(Base):
    __tablename__ = "podas"

    id = Column(Integer, primary_key=True, index=True)
    cama_id = Column(Integer, ForeignKey("camas.id"), nullable=False)
    fecha = Column(DateTime, default=obtener_hora_ecuador)
    tallos_largos = Column(Integer, default=0)
    tallos_medios = Column(Integer, default=0)
    tallos_cortos = Column(Integer, default=0)
    total_podados = Column(Integer, default=0)
    observaciones = Column(Text, nullable=True)

    cama = relationship("Cama")

class Segmento(Base):
    __tablename__ = "segmentos"

    id = Column(Integer, primary_key=True, index=True)
    cama_id = Column(Integer, ForeignKey("camas.id"), nullable=False)
    lado = Column(String(1), nullable=False, default="A")
    nombre = Column(String(50), nullable=False)
    activo = Column(Boolean, default=True)

    cama = relationship("Cama", back_populates="segmentos")

class CicloCama(Base):
    __tablename__ = "ciclo_cama"

    cama_id = Column(Integer, ForeignKey("camas.id"), primary_key=True)
    dias_arroz_cosecha = Column(Float, default=35)
    dias_alberja_cosecha = Column(Float, default=28)
    dias_garbanzo_cosecha = Column(Float, default=21)
    dias_rayando_cosecha = Column(Float, default=14)
    dias_estrella_cosecha = Column(Float, default=7)
    ultima_actualizacion = Column(DateTime, default=obtener_hora_ecuador)


class HistorialProyeccion(Base):
    __tablename__ = "historial_proyeccion"

    id = Column(Integer, primary_key=True, index=True)
    cama_id = Column(Integer, ForeignKey("camas.id"), nullable=False)
    fecha_proyectada = Column(DateTime, nullable=False)
    fecha_generacion = Column(DateTime, default=obtener_hora_ecuador)
    botones_proyectados = Column(Integer, default=0)
    botones_cosechados_real = Column(Integer, nullable=True)
    comparado = Column(Boolean, default=False)