# RFQ Intelligence

Procurement automation tool that helps government contractors find and respond to RFQs by analyzing solicitation documents, sourcing matching products, and generating quotes.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Copy environment file and configure:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Initialize database:
```bash
alembic upgrade head
```

4. Run the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Project Structure

```
app/
├── api/          # API routes
├── core/         # Core configuration
├── models/       # Database models
├── services/     # Business logic
└── utils/        # Utility functions
```