import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    print("Attempting to initialize RokhasAgent...")
    from pipeline.agent import RokhasAgent
    agent = RokhasAgent()
    print("Agent initialized successfully!")
except Exception as e:
    print(f"Failed to initialize agent: {e}")
    import traceback
    traceback.print_exc()
