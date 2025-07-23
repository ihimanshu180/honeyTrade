from flask import Blueprint, request, jsonify
from .models import Portfolio
from . import db
from .auth import token_required, store_token, expire_token
import requests, json

bp = Blueprint("portfolio", __name__)

@bp.route("/", methods=["GET"])
@token_required
def get_portfolio():
    portfolios = Portfolio.query.filter_by(user_id = request.user_id).all()
    return jsonify([p.to_dict() for p in portfolios])


@bp.route("/create", methods=["POST"])
@token_required
def create_portfolio():
    data = request.get_json()
    name = data["name"]
    user_id = data["user_id"]
    stocks = data.get("stocks", [])
    portfolio = Portfolio(user_id = user_id, name = name, stocks = json.dumps(stocks))
    db.session.add(portfolio)
    db.session.commit()
    return jsonify(portfolio.to_dict())

"""
NOte: why stocks=json.dumps(stocks)

✅ Purpose:
This line converts the stocks list (a Python object) into a JSON string before storing it in the database.

💡 Why?
In your Portfolio model:
stocks = db.Column(db.Text, nullable=False)
You're storing the stocks as Text, which only accepts strings, not Python lists or objects.

So we use json.dumps() to serialize the list into a string (like '["AAPL", "TSLA", "GOOGL"]').

When retrieving the portfolio, you reverse this using:

json.loads(self.stocks)
"""


@bp.route("/<int:portfolio_id>", methods=["DELETE"])
@token_required
def delete_portfolio(portfolio_id):
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio or portfolio.user_id != request.user_id:
        return jsonify({"error": "Not found"})
    db.session.delete(portfolio)
    db.session.commit()
    return jsonify({"message": "Portfolio {} deleted".format(portfolio.name)})


@bp.route("/<int:portfolio_id>/value", methods=["GET"])
@token_required
def value_portfolio(portfolio_id):
    portfolio = Portfolio.query.get(portfolio_id)
    if not portfolio or portfolio.user_id != request.user_id:
        return jsonify({"error": "Not found"}), 404
    symbols = json.loads(portfolio.stocks)
    query = ",".join(symbols)
    res = requests.get(f"http://localhost:5002/prices?symbols={query}&source=yahoo")
    prices = res.json()
    total_value = sum(prices.get(sym, 0) for sym in symbols if isinstance(prices.get(sym), (int, float)))
    return jsonify({'total_value': round(total_value, 2), 'prices': prices})


@bp.route('/logout', methods=['POST'])
@token_required
def logout():
    token = request.headers.get('Authorization').split(" ")[1]
    expire_token(token)
    return jsonify({'message': 'Logged out and token revoked'})