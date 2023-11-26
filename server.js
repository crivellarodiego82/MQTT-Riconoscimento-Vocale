const http = require('http');
const WebSocketServer = require('websocket').server;
const Vosk = require('vosk');
const mqtt = require('mqtt');

const server = http.createServer((request, response) => {
  // Gestire le richieste HTTP se necessario
});

server.listen(8080, () => {
  console.log('Server WebSocket in ascolto sulla porta 8080');
});

const voskModelPath = '/home/iot/Voce/italiano'; // Specifica il percorso del tuo modello Vosk
const model = new Vosk.Model(voskModelPath);
const recognizer = new Vosk.Recognizer({ model: model });

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', (request) => {
  const connection = request.accept('echo-protocol', request.origin);

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const audioData = JSON.parse(message.utf8Data);

      // Esegui il riconoscimento del discorso
      const recognizedText = recognizeSpeech(audioData);

      // Invia il testo riconosciuto tramite MQTT
      sendViaMQTT(recognizedText);
    }
  });

  connection.on('close', (reasonCode, description) => {
    console.log(`Connessione WebSocket chiusa: ${reasonCode} - ${description}`);
  });
});

function recognizeSpeech(audioData) {
  if (!audioData || !audioData.audioBuffer) {
    console.error('Dati audio non validi');
    return '';
  }

  const buffer = Buffer.from(audioData.audioBuffer);
  const result = recognizer.acceptWaveform(buffer);
  return result.text;
}

function sendViaMQTT(text) {
  const mqttClient = mqtt.connect('mqtt://172.201.123.94', {
    username: 'iot',
    password: 'P@ssw0rd'
  });

  mqttClient.on('connect', () => {
    console.log('Connesso al server MQTT');
    mqttClient.publish('Voce', text, (err) => {
      if (err) {
        console.error('Errore nell\'invio del messaggio MQTT:', err);
      } else {
        console.log('Messaggio MQTT inviato con successo:', text);
      }
      mqttClient.end();
    });
  });
}
