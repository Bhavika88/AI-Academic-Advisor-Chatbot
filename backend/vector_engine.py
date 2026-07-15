# import faiss
# import numpy as np
# from sentence_transformers import SentenceTransformer


# # 1. Load a lightweight, industry-standard embedding model
# # 'all-MiniLM-L6-v2' is fast and perfect for academic projects
# model = SentenceTransformer('all-MiniLM-L6-v2')

# # 2. Sample data (We will replace this with PDF/CSV data in Phase 3)
# knowledge_base = [
#     "The CS Honors program requires a minimum GPA of 3.8.",
#     "Admissions for the Fall semester close on August 15th.",
#     "To graduate, a student must complete 120 total credits.",
#     "The Career Center offers mock interviews every Thursday.",
#     "Machine Learning is a core elective for senior CS students."
# ]

# # 3. Create the Index
# def build_vector_db():
#     # Convert text to numbers (Embeddings)
#     embeddings = model.encode(knowledge_base)
    
#     # Get the dimension size (usually 384 for this model)
#     dimension = embeddings.shape[1]
    
#     # Create a FAISS index (FlatL2 = Simple Euclidean distance search)
#     index = faiss.IndexFlatL2(dimension)
#     index.add(np.array(embeddings).astype('float32'))
    
#     return index, knowledge_base

# def search_knowledge(query, index, documents, top_k=1):
#     # Convert user query to numbers
#     query_embedding = model.encode([query])
    
#     # Search the index for the 'k' most similar documents
#     distances, indices = index.search(np.array(query_embedding).astype('float32'), top_k)
    
#     # Return the best matching text
#     return documents[indices[0][0]]

# # Initialize the index once when the app starts
# vector_index, docs = build_vector_db()

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from data_processor import load_academic_docs, chunk_data

model = SentenceTransformer('all-MiniLM-L6-v2')

# Load files from the 'data' folder
raw_data = load_academic_docs("data/handbook.pdf", "data/courses.csv")
processed_docs = chunk_data(raw_data)

def build_vector_db():
    if not processed_docs:
        print("⚠️ Warning: No documents found in data/ folder!")
        return None, []
        
    texts = [d["content"] for d in processed_docs]
    embeddings = model.encode(texts)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(np.array(embeddings).astype('float32'))
    return index, processed_docs

vector_index, docs = build_vector_db()

def search_knowledge(query, index, documents, top_k=2):
    if index is None or not documents: 
        return "No academic records available."
    query_vec = model.encode([query])
    distances, indices = index.search(np.array(query_vec).astype('float32'), top_k)

    context_list = []
    for i in range(len(indices[0])):
        idx = indices[0][i]
        if idx != -1: # Ensure a match was found
            match = documents[idx]
            context_list.append(f"[{match['metadata']}]: {match['content']}")
    
    return "\n".join(context_list)