#!/bin/bash
# Railway startup script
# Trains ML model if .pkl files don't exist, then starts the server

if [ ! -f "rf_model.pkl" ]; then
    echo "Model files not found — training now..."
    python train_model.py
    echo "Training complete."
else
    echo "Model files found — skipping training."
fi

uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
