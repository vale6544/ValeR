import cv2
import numpy as np
import os

carpeta = 'app/imagenes'
fotos = sorted(os.listdir(carpeta))
ruta = os.path.join(carpeta, fotos[-1])
print('Analizando:', ruta)

# Paso 1
imagen = cv2.imread(ruta)
print('1. Imagen cargada:', imagen is not None, '- tamaño:', imagen.shape if imagen is not None else 'None')

# Paso 2
lab = cv2.cvtColor(imagen, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)
clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
l = clahe.apply(l)
lab = cv2.merge((l, a, b))
imagen = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
print('2. Preprocesamiento OK')

# Paso 3
hsv = cv2.cvtColor(imagen, cv2.COLOR_BGR2HSV)
rojo1 = cv2.inRange(hsv, np.array([0, 80, 50]),   np.array([12, 255, 255]))
rojo2 = cv2.inRange(hsv, np.array([150, 60, 50]), np.array([180, 255, 255]))
rosa  = cv2.inRange(hsv, np.array([135, 50, 50]), np.array([175, 255, 255]))
mascara = cv2.bitwise_or(cv2.bitwise_or(rojo1, rojo2), rosa)
pixeles = cv2.countNonZero(mascara)
print('3. Píxeles rojos/rosa:', pixeles)

# Paso 4
kernel = np.ones((5, 5), np.uint8)
mascara = cv2.morphologyEx(mascara, cv2.MORPH_CLOSE, kernel)
mascara = cv2.morphologyEx(mascara, cv2.MORPH_OPEN,  kernel)
contornos, _ = cv2.findContours(mascara, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
print('4. Contornos tota