from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Logging configuration
logging.basicConfig(level=logging.INFO)

# Load and prepare the data
df = pd.read_csv('qa_data.csv', encoding='latin1', on_bad_lines='skip')
questions = df['Question'].tolist()
answers = df['Answer'].tolist()
links = df['Links'].tolist()  # New column for links

# Set up TF-IDF and Nearest Neighbors
vectorizer = TfidfVectorizer(stop_words='english')
X = vectorizer.fit_transform(questions)
model = NearestNeighbors(n_neighbors=1, metric='cosine')
model.fit(X)

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
