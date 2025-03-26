#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path
import logging
import socket

# Configure logging to be less noisy
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Only log errors and important messages
        if args[1].startswith('code 404') or args[1].startswith('code 500'):
            logger.warning(f"{args[0]} - {args[1]}")
        elif not args[1].startswith('"GET /favicon.ico'):
            logger.info(f"{args[0]} - {args[1]}")

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except ConnectionAbortedError:
            # Ignore connection aborted errors
            pass
        except socket.error as e:
            # Ignore socket errors
            pass
        except Exception as e:
            logger.error(f"Error handling request: {e}")

    def send_error(self, code, message=None):
        try:
            super().send_error(code, message)
        except ConnectionAbortedError:
            # Ignore connection aborted errors during error sending
            pass

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    """Handle requests in a separate thread."""
    daemon_threads = True
    allow_reuse_address = True

def find_available_port(start_port=8000, max_port=8999):
    """Find an available port in the given range."""
    for port in range(start_port, max_port + 1):
        try:
            with ThreadedHTTPServer(("", port), QuietHandler) as s:
                return port
        except OSError:
            continue
    raise RuntimeError(f"Could not find an available port between {start_port} and {max_port}")

def serve(port=None):
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    dist_dir = project_root / 'dist'
    
    # Check if the dist directory exists
    if not dist_dir.exists():
        print("Error: dist directory not found. Please run 'npm run build' first.")
        sys.exit(1)
    
    # Change to the dist directory
    os.chdir(dist_dir)
    
    # Create handler with custom headers for PWA
    class CORSRequestHandler(QuietHandler):
        def end_headers(self):
            # Add headers for PWA support
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            super().end_headers()
    
    try:
        # If no port specified, find an available one
        if port is None:
            port = find_available_port()
        
        # Create server
        with ThreadedHTTPServer(("", port), CORSRequestHandler) as httpd:
            print(f"\n🚀 Server running at http://localhost:{port}")
            print("Press Ctrl+C to stop the server\n")
            # Open the browser
            webbrowser.open(f'http://localhost:{port}')
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n👋 Shutting down server...")
                httpd.shutdown()
    except OSError as e:
        print(f"Error: Could not start server on port {port}")
        print(f"Details: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Allow custom port via command line argument
    port = int(sys.argv[1]) if len(sys.argv) > 1 else None
    serve(port) 