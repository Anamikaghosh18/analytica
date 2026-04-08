# monitor_engine.py
import requests
import sqlite3
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

class APIMonitor:
    def __init__(self):
        self.conn = sqlite3.connect('monitoring.db')
        self.setup_db()
    
    def setup_db(self):
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS api_checks (
                id INTEGER PRIMARY KEY,
                endpoint TEXT,
                method TEXT,
                status_code INTEGER,
                response_time_ms REAL,
                success BOOLEAN,
                timestamp DATETIME,
                error_message TEXT
            )
        ''')
    
    def check_endpoint(self, endpoint_config):
        """Test a single API endpoint"""
        start_time = time.time()
        try:
            response = requests.request(
                method=endpoint_config['method'],
                url=endpoint_config['url'],
                headers=endpoint_config.get('headers', {}),
                timeout=30
            )
            response_time = (time.time() - start_time) * 1000
            success = 200 <= response.status_code < 300
            
            self.conn.execute(
                "INSERT INTO api_checks VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (None, endpoint_config['url'], endpoint_config['method'],
                 response.status_code, response_time, success, 
                 datetime.now(), None)
            )
            self.conn.commit()
            return success, response_time, response.status_code
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            self.conn.execute(
                "INSERT INTO api_checks VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (None, endpoint_config['url'], endpoint_config['method'],
                 None, response_time, False, datetime.now(), str(e))
            )
            self.conn.commit()
            return False, response_time, None
    
    def run_all_checks(self, endpoints):
        """Run checks for all configured endpoints in parallel"""
        with ThreadPoolExecutor(max_workers=5) as executor:
            results = executor.map(self.check_endpoint, endpoints)
        return list(results)