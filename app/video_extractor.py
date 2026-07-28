"""
Extraccion de fotogramas desde un video de recorrido de una seccion de cama.

Estrategias disponibles:
1. extraer_por_diferencia_visual (PRINCIPAL): extrae fotogramas solo cuando
   la escena cambia lo suficiente respecto al fotograma anterior. Genera entre
   4 y 12 fotogramas representativos sin duplicar zonas del recorrido.

2. extraer_fotogramas_muestra (RESPALDO): distribucion uniforme de N fotogramas
   a lo largo del video. Usar solo si la diferencia visual falla.

3. extraer_fotogramas_espaciados (DESCARTADA): extrae cada N segundos.
   Causa sobreconteo estructural en camas largas. No usar en produccion.
"""

import cv2
import os
import numpy as np
from datetime import datetime


def _abrir_video(ruta_video: str):
    cap = cv2.VideoCapture(ruta_video)
    if not cap.isOpened():
        raise ValueError(f"No se pudo abrir el video: {ruta_video}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duracion_seg = total_frames / fps if fps > 0 else 0
    return cap, fps, total_frames, duracion_seg


def _diferencia_entre_frames(frame_a, frame_b) -> float:
    """
    Calcula el porcentaje de diferencia visual entre dos fotogramas.
    Retorna un valor entre 0 (identicos) y 100 (completamente distintos).
    """
    gris_a = cv2.cvtColor(frame_a, cv2.COLOR_BGR2GRAY)
    gris_b = cv2.cvtColor(frame_b, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(gris_a, gris_b)
    return float(np.mean(diff))


def _guardar_frame(frame, carpeta: str, prefijo: str, indice: int, total: int) -> str:
    """
    Guarda un fotograma como JPEG. El nombre incluye posicion y total
    para que Claude entienda el contexto espacial del recorrido.
    Ejemplo: frame_20240630_143012_pos03de08.jpeg
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nombre = f"{prefijo}_{timestamp}_pos{indice:02d}de{total:02d}.jpeg"
    ruta = os.path.join(carpeta, nombre)
    cv2.imwrite(ruta, frame, [cv2.IMWRITE_JPEG_QUALITY, 88])
    return ruta


def extraer_por_diferencia_visual(
    ruta_video: str,
    carpeta_salida: str,
    cantidad_maxima: int = None,
    cantidad_minima: int = None,
    umbral_inicial: float = 18.0
) -> list:
    """
    FUNCION PRINCIPAL. Extrae fotogramas solo cuando la escena cambia
    lo suficiente respecto al ultimo fotograma guardado.

    Proceso:
    - Siempre incluye el primer y ultimo fotograma del video.
    - Entre ellos, acepta un nuevo fotograma solo si su diferencia visual
      respecto al anterior aceptado supera el umbral.
    - Si se supera cantidad_maxima, aumenta el umbral y repite.
    - Si no se llega a cantidad_minima, baja el umbral y repite.

    Retorna lista de rutas con nombre que indica posicion en el recorrido
    (ej: pos03de08), para que Claude entienda el contexto espacial.
    """
    cap, fps, total_frames, duracion_seg = _abrir_video(ruta_video)

    if total_frames < 2 or duracion_seg == 0:
        cap.release()
        raise ValueError("El video no tiene duracion valida o esta corrupto.")

    if cantidad_maxima is None:
        # Extraer proporcional a la duración (aproximadamente 1 frame cada 2-3 seg),
        # limitado a un máximo absoluto de 20 por el límite de imágenes de la API de Anthropic.
        cantidad_maxima = max(10, min(20, int(duracion_seg * 0.5)))

    if cantidad_minima is None:
        cantidad_minima = max(4, min(10, int(cantidad_maxima * 0.5)))

    # Paso de muestreo: evaluar 1 frame por cada 0.5 segundos como candidato
    paso_evaluacion = max(1, int(fps * 0.5))

    umbral = umbral_inicial
    intentos = 0
    frames_seleccionados = []

    while intentos < 8:
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        seleccionados = []
        ultimo_frame_guardado = None
        frame_idx = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % paso_evaluacion == 0:
                if ultimo_frame_guardado is None:
                    # Siempre incluir el primer fotograma
                    seleccionados.append((frame_idx, frame.copy()))
                    ultimo_frame_guardado = frame.copy()
                else:
                    diferencia = _diferencia_entre_frames(ultimo_frame_guardado, frame)
                    if diferencia >= umbral:
                        seleccionados.append((frame_idx, frame.copy()))
                        ultimo_frame_guardado = frame.copy()

            frame_idx += 1

        # Verificar si el ultimo frame del video ya esta incluido
        if seleccionados:
            cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames - 1)
            ret, ultimo = cap.read()
            if ret:
                ultimo_guardado_idx = seleccionados[-1][0]
                if ultimo_guardado_idx < total_frames - int(fps * 1.5):
                    seleccionados.append((total_frames - 1, ultimo))

        cantidad = len(seleccionados)

        if cantidad_minima <= cantidad <= cantidad_maxima:
            frames_seleccionados = seleccionados
            break
        elif cantidad > cantidad_maxima:
            umbral += 5.0
        elif cantidad < cantidad_minima:
            umbral = max(5.0, umbral - 5.0)

        intentos += 1
        frames_seleccionados = seleccionados

    cap.release()

    if not frames_seleccionados:
        raise ValueError("No se pudieron extraer fotogramas validos del video.")

    # Guardar con nombre que indica posicion en el recorrido
    total = len(frames_seleccionados)
    rutas = []
    for i, (_, frame) in enumerate(frames_seleccionados, start=1):
        ruta = _guardar_frame(frame, carpeta_salida, "frame", i, total)
        rutas.append(ruta)

    return rutas


def extraer_fotogramas_muestra(
    ruta_video: str,
    carpeta_salida: str,
    cantidad_maxima: int = 8
) -> list:
    """
    RESPALDO. Distribucion uniforme de N fotogramas a lo largo del video.
    Usar si extraer_por_diferencia_visual falla o el video es muy corto.
    No detecta cambio visual: puede incluir frames similares si el operario
    camina lento en alguna zona.
    """
    cap, fps, total_frames, duracion_seg = _abrir_video(ruta_video)

    if total_frames == 0:
        cap.release()
        raise ValueError("El video no tiene fotogramas validos o esta corrupto.")

    cantidad = min(cantidad_maxima, total_frames)
    indices = [int(i * total_frames / cantidad) for i in range(cantidad)]

    total = len(indices)
    rutas = []
    for pos, (i, frame_num) in enumerate(enumerate(indices), start=1):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ret, frame = cap.read()
        if not ret:
            continue
        ruta = _guardar_frame(frame, carpeta_salida, "muestra", pos, total)
        rutas.append(ruta)

    cap.release()
    return rutas


def extraer_fotogramas_espaciados(
    ruta_video: str,
    carpeta_salida: str,
    intervalo_segundos: float = 2.0
) -> list:
    """
    DESCARTADA EN PRODUCCION. Extrae un fotograma cada N segundos.
    Causa sobreconteo estructural: la misma flor aparece en multiples
    fotogramas y se cuenta varias veces (prueba: 767 tallos vs 25 reales).
    Se mantiene solo para referencia y comparacion en pruebas.
    """
    cap, fps, total_frames, duracion_seg = _abrir_video(ruta_video)

    if duracion_seg == 0:
        cap.release()
        raise ValueError("El video no tiene duracion valida o esta corrupto.")

    intervalo_frames = max(1, int(fps * intervalo_segundos))
    rutas = []
    timestamp_base = datetime.now().strftime("%Y%m%d_%H%M%S")
    frame_idx = 0
    fotograma_num = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % intervalo_frames == 0:
            nombre = f"espaciado_{timestamp_base}_{fotograma_num:03d}.jpeg"
            ruta = os.path.join(carpeta_salida, nombre)
            cv2.imwrite(ruta, frame, [cv2.IMWRITE_JPEG_QUALITY, 88])
            rutas.append(ruta)
            fotograma_num += 1
        frame_idx += 1

    cap.release()
    return rutas


def info_video(ruta_video: str) -> dict:
    """Retorna metadatos basicos del video."""
    cap, fps, total_frames, duracion_seg = _abrir_video(ruta_video)
    cap.release()
    return {
        "fps": round(fps, 1),
        "total_frames": total_frames,
        "duracion_segundos": round(duracion_seg, 1)
    }