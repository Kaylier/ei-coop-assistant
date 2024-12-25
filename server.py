#!/usr/bin/env python3
import logging
logger = logging.getLogger(__name__)

import http.server
import socketserver
from datetime import datetime
import sys


# List of predefined paths that should return index.xhtml
routing_paths = ['/', '/hoa', '/laying-set']
redirects = dict.fromkeys(routing_paths, '/index.xhtml')


class Handler(http.server.SimpleHTTPRequestHandler):

    extensions_map = {
            '.manifest': 'text/cache-manifest',
            '.html': 'text/html',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.svg':	'image/svg+xml',
            '.css':	'text/css',
            '.js':	'application/x-javascript',
            '.ts':	'application/typescript',
            '': 'application/octet-stream',
            }

    log_error = logger.warning
    log_message = logger.info

    def do_GET(self):
        requested_path = self.path
        self.path = redirects.get(self.path, self.path)
        if self.path != requested_path:
            logger.info(f"Redirected {requested_path} to {self.path}")
        try:
            return super().do_GET()
        except BrokenPipeError:
            logger.warning(f"Premature disconnect from client")

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            logging.warning(f"404 Not Found: {self.path}. Serving index.xhtml for user error message.")
            try:
                self.path = '/index.xhtml'
                self.send_response(404)
                self.send_header("Content-type", "application/xhtml+xml")
                self.end_headers()
                with open('index.xhtml', 'rb') as file:
                    self.wfile.write(file.read())
            except Exception as e:
                logging.error(f"Cannot handle 404 properly: {e}")
                super().send_error(code, message, explain)
        else:
            super().send_error(code, message, explain)


def main(address):
    with http.server.HTTPServer(address, Handler) as httpd:
        logger.info(f"Serving on port {address[1]}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            logger.info("\nServer is shutting down...")


if __name__ == '__main__':
    # Read port from command-line arguments, default to 8000
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    main(("", port))

