# Use official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy the entire api folder contents to /app
COPY api/ .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (Render uses PORT env var, but uvicorn can be told where to listen)
EXPOSE 10000

# Start command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
