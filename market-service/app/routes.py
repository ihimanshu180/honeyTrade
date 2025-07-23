from flask import Blueprint, request, jsonify
from .price_fetcher import price_fetcher_alpha, price_fetcher_yahoo, fetch_multiple_prices

bp = Blueprint('market-service', __name__)

@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "market-service is live 🔥"})


@bp.route("/price/<symbol>", methods=["GET"])
def get_price(symbol):
    source = request.args.get("source", "alpha").lower()
    symbol = symbol.upper()

    if source == "yahoo":
        price = price_fetcher_yahoo(symbol)
    else:
        price = price_fetcher_alpha(symbol)

    if price is None:
        return jsonify({"symbol": symbol, "price": "Not found", "source": source}), 404

    return jsonify({"symbol": symbol, "price": price, "source": source})


@bp.route("/prices", methods=["GET"])
def get_prices():
    symbols = request.args.get("symbols", "")
    source = request.args.get("source", "alpha").lower()
    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]

    if not symbol_list:
        return jsonify({"error": "No symbols provided"}), 400

    result = fetch_multiple_prices(symbol_list, source)
    return jsonify(result)
