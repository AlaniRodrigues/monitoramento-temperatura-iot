import network, time, json, dht
from machine import Pin
from umqtt.simple import MQTTClient
from config import MQTT_HOST, MQTT_PORT, MQTT_USER, MQTT_PASSWORD, DEVICE_ID, TOPIC, SEND_INTERVAL_MS

sensores = [
    ("cerveja-01", dht.DHT22(Pin(4))),
    ("guarana-01", dht.DHT22(Pin(5))),
    ("suco-01", dht.DHT22(Pin(18))),
    ("energetico-01", dht.DHT22(Pin(19))),
    ("agua-01", dht.DHT22(Pin(21))),
]
wifi = network.WLAN(network.STA_IF)
wifi.active(True)
client = None
while True:
    try:
        if not wifi.isconnected():
            wifi.connect("Wokwi-GUEST", "")
            while not wifi.isconnected():
                time.sleep(1)
        if client is None:
            client = MQTTClient(client_id=DEVICE_ID, server=MQTT_HOST, port=MQTT_PORT, user=MQTT_USER, password=MQTT_PASSWORD, keepalive=60, ssl=True, ssl_params={"server_hostname": MQTT_HOST})
            client.connect()
            print("Conectado ao EMQX!")
        for equipamento, sensor in sensores:
            try:
                sensor.measure()
                temperatura = sensor.temperature()
                umidade = sensor.humidity()
            except Exception as erro:
                print("Erro no sensor", equipamento, repr(erro))
                continue
            client.publish(TOPIC, json.dumps({"device_id": equipamento, "temperature": temperatura, "humidity": umidade}))
            print(equipamento, temperatura, "C - enviado")
        time.sleep_ms(SEND_INTERVAL_MS)
    except Exception as erro:
        print("Erro de conexao:", repr(erro))
        if client is not None:
            try:
                client.disconnect()
            except Exception:
                pass
        client = None
        time.sleep(5)
