#!/usr/bin/env python3
"""
Launch both server and proxy
"""
import logging
logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)

import threading

from server import main as run_server
from proxy import main as run_proxy


if __name__ == "__main__":
    server_thread = threading.Thread(target=run_server, args=[("", 8000)])
    proxy_thread = threading.Thread(target=run_proxy, args=[("", 8080)])
    server_thread.start()
    proxy_thread.start()
    server_thread.join()
    proxy_thread.join()

