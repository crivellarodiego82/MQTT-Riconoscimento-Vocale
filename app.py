from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import paho.mqtt.publish as publish  # Importa la libreria MQTT

app = Flask(__name__)
socketio = SocketIO(app)

# Configurazione MQTT
mqtt_broker_address = "20.224.60.xxx"
mqtt_username = "ai"
mqtt_password = "Pxxx"
mqtt_topic = "Voce"

# Route principale per il rendering dell'HTML
@app.route('/')
def index():
    return render_template('index.html')

# Funzione di gestione del WebSocket
@socketio.on('audio')
def handle_audio(text):
    # Ora `text` contiene il testo inviato dal lato client
    print(f'Testo ricevuto: {text}')

    # Puoi fare ulteriori elaborazioni qui, ad esempio, inviare il testo a un modello di linguaggio o fare qualsiasi altra cosa necessaria

    # Invia una risposta di conferma al lato client
#    emit('text_processed', {'message': 'Testo elaborato con successo'})

    # Invia il testo al broker MQTT
    publish.single(mqtt_topic, text, hostname=mqtt_broker_address, auth={'username': mqtt_username, 'password': mqtt_password})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5002, debug=True)
