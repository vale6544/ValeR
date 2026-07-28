import re

with open("C:/rosas-monitor/dashboard/src/pages/ConfiguracionCamas.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Emojis regex
emojis = re.findall(r'[^\x00-\x7F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\u2000-\u206F\u2070-\u209F\u20A0-\u20CF\u2100-\u214F\u2150-\u218F\u2190-\u21FF\u2200-\u22FF\u2300-\u23FF\u2400-\u243F\u2440-\u245F\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF]', content)
print("Emojis encontrados:", set(emojis))
