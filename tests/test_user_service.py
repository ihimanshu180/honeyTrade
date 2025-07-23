import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'user-service'))
from app import create_app, db

@pytest.fixture()
def client():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    app = create_app()
    with app.app_context():
        db.create_all()
    return app.test_client()

def test_login_and_profile(client):
    register_data = {'username': 'alice', 'email': 'alice@example.com', 'password': 'secret'}
    resp = client.post('/api/users/register', json=register_data)
    assert resp.status_code == 201

    login_data = {'username': 'alice', 'password': 'secret'}
    resp = client.post('/api/users/login', json=login_data)
    assert resp.status_code == 200
    token = resp.get_json()['token']

    resp = client.get('/api/users/profile', headers={'Authorization': token})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['username'] == 'alice'
    assert data['email'] == 'alice@example.com'


