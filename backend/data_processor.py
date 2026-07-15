import pandas as pd
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os

def load_academic_docs(pdf_path, csv_path):
    text_chunks = []
    
    # Check if files exist to avoid crashing
    if os.path.exists(pdf_path):
        reader = PdfReader(pdf_path)
        for i, page in enumerate(reader.pages):
            content = page.extract_text()
            if content:
                text_chunks.append({"text": content, "source": f"Handbook Pg {i+1}"})
    
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        for _, row in df.iterrows():
            course_info = " | ".join([f"{col}: {val}" for col, val in row.items()])
            text_chunks.append({"text": course_info, "source": "Course Catalog"})

    return text_chunks

def chunk_data(raw_chunks):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    final_docs = []
    for item in raw_chunks:
        splits = splitter.split_text(item["text"])
        for s in splits:
            final_docs.append({"content": s, "metadata": item["source"]})
    return final_docs