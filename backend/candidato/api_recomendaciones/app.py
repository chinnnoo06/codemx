from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "¡Flask está corriendo correctamente!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Escuchar en todas las interfaces y puerto 5000
