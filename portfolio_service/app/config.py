import os


class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///portfolio.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "portfolio1801"

