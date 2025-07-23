import hashlib
from flask import request
import jwt
from functools import wraps
from .config import Config
from .models import UserToken
from datetime import datetime, timedelta


# ToDo check the working of this module
def hash_token(token:str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return {"message": "Token is required."}, 401

        try:
            token = token.split(" ")[1]
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            request.user_id = data["user_id"]
        except Exception as e:
            return {'message': f'Token error: {str(e)}'}, 401

        # check token hash in DB
        hashed = hash_token(token)
        record = UserToken.query.filter_by(token_hash=hashed).first()
        if not record or record.is_expired or record.expires_at < datetime.utcnow():
            return {'message': 'Token is expired. or revoked'}, 401
        return f(*args, **kwargs)
    return decorated


def store_token(user_id:str, token:str, expires_at =15):
    from .models import db
    token_hash = hash_token(token)
    expires_at = datetime.utcnow() + timedelta(minutes=expires_at)
    db.session.add(UserToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at))
    db.session.commit()


def expire_token(token: str):
    from . import db
    hashed = hash_token(token)
    record = UserToken.query.filter_by(token_hash=hashed).first()
    if record:
        record.is_expired = True
        db.session.commit()








