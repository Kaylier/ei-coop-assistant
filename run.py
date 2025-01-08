#!/usr/bin/env python3
"""
Launch both server and proxy
"""
import logging
import threading
import sys

logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)

from server import main as run_server
from proxy import main as run_proxy

def main():
    server_thread = threading.Thread(target=run_server, args=[("", 8000)], daemon=True)
    proxy_thread = threading.Thread(target=run_proxy, args=[("", 8080)], daemon=True)

    logging.info("Starting server and proxy threads.")
    server_thread.start()
    proxy_thread.start()

    try:
        while server_thread.is_alive() and proxy_thread.is_alive():
            server_thread.join(timeout=1)
            proxy_thread.join(timeout=1)
    except KeyboardInterrupt:
        logging.info("Shutdown signal received. Stopping server and proxy...")
        sys.exit(0)

if __name__ == "__main__":
    main()

