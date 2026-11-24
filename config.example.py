# Exemplo de configuração MQTT
# Copie este arquivo para config.py e preencha
# com as credenciais do seu ambiente.

MQTT_HOST = "SEU_HOST_EMQX"
MQTT_PORT = 8883

MQTT_USER = "SEU_USUARIO_MQTT"
MQTT_PASSWORD = "SUA_SENHA_MQTT"

DEVICE_ID = "esp32-iot"
TOPIC = "monitoramento-iot/temperatura"

SEND_INTERVAL_MS = 10000
