from . import db
import os, json


"""
Note:
Option B: You’re using JWT tokens from a separate user-service (in this case)
Then don’t enforce a foreign key in the DB. Just store the user_id as str or int, like:

Because:

You don’t have a User table in this service
user_id comes from a JWT token issued by the user-service
Cross-service foreign keys aren't enforceable in microservice architectures
"""

class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    stocks = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "stocks": json.loads(self.stocks)
            }

class UserToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), nullable=False)
    token_hash = db.Column(db.String(64), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_expired = db.Column(db.Boolean, nullable=False)
