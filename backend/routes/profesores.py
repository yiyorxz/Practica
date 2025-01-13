from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models.profesor import Profesor
from models.proyecto import Proyecto
from app import db

profesores_bp = Blueprint('profesores', __name__)

@profesores_bp.route('/profesores', methods=['GET'])
def obtener_profesores():
    try:
        print("Headers recibidos:", request.headers)
        profesores = Profesor.query.filter_by(activo=True).all() 
        
        resultado = []
        for profesor in profesores:
            proyectos_guiados = Proyecto.query.filter_by(profesor_guia_id=profesor.id)\
                                            .filter(Proyecto.nota.is_(None))\
                                            .count()
            
            proyectos_informados = Proyecto.query.filter_by(profesor_informante_id=profesor.id)\
                                               .filter(Proyecto.nota.is_(None))\
                                               .count()
            
            profesor_info = {
                'id': profesor.id,
                'nombre': profesor.nombre,
                'apellido': profesor.apellido,
                'email': profesor.email,
                'proyectos_guiados': proyectos_guiados,
                'proyectos_informados': proyectos_informados
            }
            resultado.append(profesor_info)
            
        return jsonify({
            'data': resultado,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@profesores_bp.route('/profesores', methods=['POST'])
@jwt_required()
def crear_profesor():
    try:
        data = request.get_json()
        
        required_fields = ['nombre', 'apellido', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        if Profesor.query.filter_by(email=data['email']).first():
            return jsonify({
                'error': 'El email ya está registrado',
                'status': 'error'
            }), 400
        
        nuevo_profesor = Profesor(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email']
        )
        
        db.session.add(nuevo_profesor)
        db.session.commit()
        
        return jsonify({
            'message': 'Profesor creado exitosamente',
            'profesor': nuevo_profesor.to_dict(),
            'status': 'success'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@profesores_bp.route('/profesores/<int:id>', methods=['GET'])
def obtener_profesor(id):
    try:
        profesor = Profesor.query.get_or_404(id)
        return jsonify({
            'profesor': profesor.to_dict(),
            'status': 'success'
        }), 200
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@profesores_bp.route('/profesores/<int:id>', methods=['DELETE'])
@jwt_required()
def eliminar_profesor(id):
    try:
        profesor = Profesor.query.get_or_404(id)
        
        proyectos_guiados = Proyecto.query.filter_by(profesor_guia_id=profesor.id)\
                                        .filter(Proyecto.nota.is_(None))\
                                        .count()
        
        proyectos_informados = Proyecto.query.filter_by(profesor_informante_id=profesor.id)\
                                           .filter(Proyecto.nota.is_(None))\
                                           .count()
        
        # Si tiene proyectos activos, no permitir la eliminación
        if proyectos_guiados > 0 or proyectos_informados > 0:
            return jsonify({
                'error': f'No se puede eliminar el profesor porque tiene {proyectos_guiados + proyectos_informados} proyecto(s) activo(s)',
                'status': 'error'
            }), 400
        
        profesor.activo = False
        db.session.commit()
        
        return jsonify({
            'message': 'Profesor eliminado exitosamente',
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@profesores_bp.route('/profesores/<int:id>', methods=['PUT'])
@jwt_required()
def actualizar_profesor(id):
    try:
        profesor = Profesor.query.get_or_404(id)
        data = request.get_json()
        
        required_fields = ['nombre', 'apellido', 'email']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'error': f'El campo {field} es requerido',
                    'status': 'error'
                }), 400
        
        profesor_existente = Profesor.query.filter_by(email=data['email']).first()
        if profesor_existente and profesor_existente.id != id:
            return jsonify({
                'error': 'El email ya está registrado',
                'status': 'error'
            }), 400
            
        profesor.nombre = data['nombre']
        profesor.apellido = data['apellido']
        profesor.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profesor actualizado exitosamente',
            'profesor': profesor.to_dict(),
            'status': 'success'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
        
@profesores_bp.route('/profesores/<int:id>/detalle', methods=['GET'])
def obtener_profesor_detalle(id):
    try:
        profesor = Profesor.query.get_or_404(id)
        
        proyectos_guiados = Proyecto.query.filter_by(profesor_guia_id=profesor.id)\
                                        .filter(Proyecto.nota.is_(None))\
                                        .all()
        
        proyectos_informados = Proyecto.query.filter_by(profesor_informante_id=profesor.id)\
                                           .filter(Proyecto.nota.is_(None))\
                                           .all()
        
        proyectos_guiados_data = [{
            'id': p.id,
            'titulo': p.titulo,
            'descripcion': p.descripcion,
            'estudiante': f"{p.estudiante.nombre} {p.estudiante.apellido}",
            'estudiante_email': p.estudiante.email
        } for p in proyectos_guiados]
        
        proyectos_informados_data = [{
            'id': p.id,
            'titulo': p.titulo,
            'descripcion': p.descripcion,
            'estudiante': f"{p.estudiante.nombre} {p.estudiante.apellido}",
            'estudiante_email': p.estudiante.email
        } for p in proyectos_informados]
        
        profesor_detalle = {
            'id': profesor.id,
            'nombre': profesor.nombre,
            'apellido': profesor.apellido,
            'email': profesor.email,
            'proyectos_guiados': proyectos_guiados_data,
            'proyectos_informados': proyectos_informados_data,
            'total_proyectos_guiados': len(proyectos_guiados_data),
            'total_proyectos_informados': len(proyectos_informados_data)
        }
        
        return jsonify({
            'profesor': profesor_detalle,
            'status': 'success'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500