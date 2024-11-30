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

@app.route('/ask', methods=['POST'])
def ask_bot():
    user_question = request.json.get('question')
    if not user_question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        # Find the closest match for the user's question
        user_question_vec = vectorizer.transform([user_question])
        _, indices = model.kneighbors(user_question_vec)
        answer_idx = indices[0][0]

        response = {
            'answer': answers[answer_idx]
        }

        # Add link if available
        if pd.notna(links[answer_idx]):  # Check if the link is not NaN
            response['link'] = links[answer_idx]

        logging.info(f"Matched question: {questions[answer_idx]}")
        logging.info(f"Response: {response}")

        return jsonify(response)
    except Exception as e:
        logging.error(f"Error processing question: {str(e)}")
        return jsonify({'error': 'Something went wrong. Please try again later.'}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
