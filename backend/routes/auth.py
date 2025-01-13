from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from models.secretaria import Secretaria
from app import db, jwt

auth_bp = Blueprint('auth', __name__)

# Manejador de tokens expirados
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'status': 'error',
        'error': 'El token ha expirado'
    }), 401

@auth_bp.route('/registro/secretaria', methods=['POST'])
def registrar_secretaria():
    print("Intentando registrar secretaria")
    try:
        data = request.get_json()
        print("Datos recibidos:", data)
        
        required_fields = ['nombre', 'apellido', 'email', 'contrasena']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        if Secretaria.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': 'El email ya está registrado',
                'status': 'error'
            }), 400
        
        nueva_secretaria = Secretaria(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email'],
            contrasena=generate_password_hash(data['contrasena'], method='pbkdf2:sha256')
        )
        
        db.session.add(nueva_secretaria)
        db.session.commit()
        
        # Crear tokens
        access_token = create_access_token(identity=str(nueva_secretaria.id))
        refresh_token = create_refresh_token(identity=str(nueva_secretaria.id))
        
        return jsonify({
            'message': 'Secretaria registrada exitosamente',
            'secretaria': nueva_secretaria.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'status': 'success'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@auth_bp.route('/login/secretaria', methods=['POST'])
def login_secretaria():
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'contrasena' not in data:
            return jsonify({
                'error': 'Email y contraseña son requeridos',
                'status': 'error'
            }), 400
        
        secretaria = Secretaria.query.filter_by(email=data['email']).first()
        
        if not secretaria or not check_password_hash(secretaria.contrasena, data['contrasena']):
            return jsonify({
                'error': 'Credenciales inválidas',
                'status': 'error'
            }), 401
        
<<<<<<< HEAD
        # Crear tokens
        access_token = create_access_token(identity=str(secretaria.id))
        refresh_token = create_refresh_token(identity=str(secretaria.id))
=======
        access_token = create_access_token(identity=str(secretaria.id))
>>>>>>> 78bd80f89e48b77dbd938f2486790b105d59cf54
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'secretaria': secretaria.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        
        return jsonify({
            'message': 'Token de acceso actualizado',
            'access_token': access_token,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({
        'message': 'Sesión cerrada exitosamente',
        'status': 'success'
    }), 200