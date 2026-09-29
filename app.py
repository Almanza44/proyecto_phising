import os
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template("dashboard.html")

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)

with app.app_context():
    db.create_all()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    usuario = data.get('usuario')
    email = data.get('email')
    password = data.get('password')

    if not email:
        return jsonify({'error': 'Necesita ingresar un correo'}), 400

    if Usuario.query.filter_by(nombre=usuario).first():
        return jsonify({'error': 'El usuario ya existe'}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({'error': 'Ya existe un usuario con ese correo'}), 400

    hashed_password = generate_password_hash(password)
    nuevo_usuario = Usuario(
        nombre=usuario,
        email=email,
        password_hash=hashed_password
    )
    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({'mensaje': 'Usuario creado'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    usuario = data.get('usuario')
    password = data.get('password')

    user = Usuario.query.filter_by(nombre=usuario).first()
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 401

    if check_password_hash(user.password_hash, password):
        return jsonify({'mensaje': 'Login exitoso', 'token': 'token-falso-super-basico'})
    else:
        return jsonify({'error': 'Contraseña incorrecta'}), 401

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)