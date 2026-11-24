import network
import time
import json
import dht

from machine import Pin
from umqtt.simple import MQTTClient
from config import (
    MQTT_HOST, MQTT_PORT, MQTT_USER,
    MQTT_PASSWORD, DEVICE_ID, TOPIC,
    SEND_INTERVAL_MS
)

sensor = dht.DHT22(Pin(4))

wifi = network.WLAN(network.STA_IF)
wifi.active(True)

print("Conectando ao Wi-Fi...")
wifi.connect("Wokwi-GUEST", "")

while not wifi.isconnected():
    time.sleep(1)

print("Wi-Fi conectado!")

client = MQTTClient(
    client_id=DEVICE_ID,
    server=MQTT_HOST,
    port=MQTT_PORT,
    user=MQTT_USER,
    password=MQTT_PASSWORD,
    keepalive=60,
    ssl=True,
    ssl_params={"server_hostname": MQTT_HOST}
)

client.connect()
print("Conectado ao EMQX!")

while True:
    try:
        sensor.measure()

        temperatura = sensor.temperature()
        umidade = sensor.humidity()

        mensagem = {
            "device_id": DEVICE_ID,
            "temperature": temperatura,
            "humidity": umidade
        }

        client.publish(TOPIC, json.dumps(mensagem))

        print("Temperatura:", temperatura, "C")
        print("Umidade:", umidade, "%")
        print("Mensagem enviada ao EMQX!")
        print("------------------------")

        time.sleep_ms(SEND_INTERVAL_MS)

    except Exception as erro:
        print("Erro:", repr(erro))
        time.sleep(5)
