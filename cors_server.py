#!/usr/bin/env python3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super(CORSRequestHandler, self).end_headers()

def run(server_class=HTTPServer, handler_class=CORSRequestHandler, port=9999):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting CORS-enabled HTTP server on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
