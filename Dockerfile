# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire api folder contents to /app
COPY api/ .

# Ensure data directory exists inside /app if expected by the code
# The chatbot_engine.py expects ./data/intents... relative to itself

# Expose port (Render uses PORT env var, but uvicorn can be told where to listen)
EXPOSE 10000

# Start command
CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port", "10000"]
