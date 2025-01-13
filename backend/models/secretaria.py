from app import db

class Secretaria(db.Model):
    __tablename__ = 'secretarias'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': str(self.id),
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email
        }