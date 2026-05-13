#!/usr/bin/env python3
import os
import sys

print("Starting dataset generation test...")
print(f"Current directory: {os.getcwd()}")
print(f"Python version: {sys.version}")

try:
    from generate_training_datasets import main
    print("Import successful")
    main()
    print("Generation complete")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
