from flask import Flask
from flask_cors import CORS
from .routes import bp
from dotenv import load_dotenv
import os

def create_app():
    load_dotenv()  # Load .env variables
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(bp)
    return app