from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel
import pandas as pd
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from pymongo import MongoClient

app = FastAPI()

# Connect to MongoDB using PyMongo
client = MongoClient(
    "mongodb+srv://congngba21:CongNguyen0408@cluster0.va8jw.mongodb.net/test?retryWrites=true&w=majority"
)
db = client["bridgability"]  # The name of your database
jobs_collection = db["jobs"]  # The collection name in MongoDB

# Fetch jobs data from MongoDB
jobs_cursor = jobs_collection.find()

# Convert the fetched data into a DataFrame
jobs_data = [
    {
        'job_name': job.get('job_name', ''),
        'job_description': job.get('job_description', ''),
        'academic_requirements': job.get('academic_requirements', ''),
        'opening_date': job.get('opening_date', ''),
        'closing_date': job.get('closing_date', '')
    } for job in jobs_cursor
]

jobs = pd.DataFrame(jobs_data)

# Ensure the DataFrame columns match the expected schema
jobs = jobs[['job_name', 'job_description', 'academic_requirements', 'opening_date', 'closing_date']]


# Load model and tokenizer
model = DistilBertForSequenceClassification.from_pretrained('./bert')
tokenizer = DistilBertTokenizer.from_pretrained('./bert')

# TF-IDF Vectorizer Initialization
tfidf_vectorizer = TfidfVectorizer(max_features=100, stop_words='english')

# Fit TF-IDF on all job descriptions
tfidf_vectorizer.fit(jobs['job_description'])
feature_names = tfidf_vectorizer.get_feature_names_out()

def extract_keywords(text):
    """
    Extract keywords from a given text using TF-IDF.
    """
    tfidf_scores = tfidf_vectorizer.transform([text]).toarray().squeeze()
    top_keywords = [feature_names[i] for i in tfidf_scores.argsort()[-10:][::-1]]
    return top_keywords

def calculate_similarity(text1, text2):
    """
    Calculate cosine similarity between two texts using TF-IDF vectors.
    """
    tfidf_matrix = tfidf_vectorizer.transform([text1, text2])
    similarity = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])
    return similarity[0][0]  # Return the similarity score

def calculate_suitability(person_bio, job_description, model, tokenizer):
    inputs = preprocess_text(person_bio, job_description, tokenizer)
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=1).squeeze().tolist()
        return probabilities[1] * 100  # Assuming class 1 is "suitable"

def preprocess_text(bio, job_description, tokenizer):
    input_text = f"Person: {bio} [SEP] Job: {job_description}"
    return tokenizer(input_text, truncation=True, padding=True, max_length=512, return_tensors='pt')


class Person(BaseModel):
    name: str
    age: int
    location: str
    bio: str

class MatchRequest(BaseModel):
    person: Person

@app.post("/match")
def match_people_to_jobs_endpoint(request: MatchRequest):
    
    try:
        print(request)
        person = request.person
        matches = []

        for _, job in jobs.iterrows():
            # Extract keywords
            job_keywords = ' '.join(extract_keywords(job['job_name']))
            person_keywords = ' '.join(extract_keywords(person.bio))

            # Calculate domain similarity
            domain_similarity = calculate_similarity(person_keywords, job_keywords)

            # Calculate suitability using the model
            suitability_score = calculate_suitability(person.bio, job_keywords, model, tokenizer)

            # Final weighted score
            final_score = (domain_similarity * 0.7 * 100) + (suitability_score * 0.1) + (len(set(person_keywords.split()) & set(job_keywords.split())) * 0.2)
            
            # Append to matches
            matches.append({
                'job_name': job['job_name'],
                'job_description': job['job_description'],
                'academic_requirements': job['academic_requirements'],
                'opening_date': job['opening_date'],
                'closing_date': job['closing_date'],
                'domain_similarity': round(domain_similarity * 100, 2),
                'suitability_score': round(suitability_score, 2),
                'final_score': round(final_score, 2)
            })

        # Sort matches by final score in descending order
        matches = sorted(matches, key=lambda x: x['final_score'], reverse=True)
        return matches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)
