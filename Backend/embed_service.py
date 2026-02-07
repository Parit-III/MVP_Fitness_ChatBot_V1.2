from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    text = data.get('text', '')
    # This matches your specific Python logic exactly
    vector = model.encode(text).tolist()
    return jsonify({"vector": vector})

if __name__ == '__main__':
    app.run(port=5001) # Runs on a different port than Node