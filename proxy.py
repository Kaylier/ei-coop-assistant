#!/usr/bin/env python3
"""
Proxy server to relay requests to a specified endpoint (through parameter 'url')
"""
import logging
logger = logging.getLogger(__name__)

from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import requests
import sys


class RequestHandler(BaseHTTPRequestHandler):

    log_error = logger.warning
    log_message = logger.info

    def _send_cors_headers(self):
        """ Sets headers required for CORS """
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "x-api-key,Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        self._handle_request("GET")

    def do_POST(self):
        self._handle_request("POST")

    def _handle_request(self, method):
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            url = query_params.get('url', [None])[0]

            if not url:
                self.send_response(400)
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(b'{"error": "No URL provided"}')
                return

            #headers = {key: value for key, value in self.headers.items()}
            headers = {'Content-Type': 'application/x-www-form-urlencoded'}

            if method == "POST":
                data_length = int(self.headers["Content-Length"])
                post_data = self.rfile.read(data_length)
                logger.info(f"Forwarding POST request to {url}")
                response = requests.post(url, headers=headers, data=post_data)
            elif method == "GET":
                logger.info(f"Forwarding GET request to {url}")
                response = requests.get(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            self.send_response(response.status_code)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            #for key, value in response.headers.items(): self.send_header(key, value)
            self.end_headers()

            self.wfile.write(response.content)
            logger.info(f"Response from {url}: {response.status_code} - {len(response.content)} bytes")
        except ValueError as e:
            logger.warning(f"Bad request: {e}")
            self.send_response(400)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"error": "Bad Request: %s"}' % str(e).encode('utf-8'))

        except requests.RequestException as e:
            logger.error(f"Error contacting target URL: {e}")
            self.send_response(502)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"error": "Bad Gateway: Failed to contact target URL"}')

        except BrokenPipeError:
            logger.warning(f"Premature disconnect from client")

        except Exception as e:
            logger.exception(f"Unexpected error: {e}")
            self.send_response(500)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"error": "Internal Server Error"}')



def main(address):
    with HTTPServer(address, RequestHandler) as httpd:
        logger.info(f"Serving on port {address[1]}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            logger.info("\nProxy server is shutting down...")


if __name__ == '__main__':
    # Read port from command-line arguments, default to 8080
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    main(("", port))

