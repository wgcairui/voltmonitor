import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { getAppDataPath } from '../utils/environment';

export class DatabaseManager {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(getAppDataPath(), 'voltmonitor.db');
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
        } else {
          console.log('Database connected successfully');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  private async createTables(): Promise<void> {
    const tables = [
      // OBD 数据记录表
      `CREATE TABLE IF NOT EXISTS obd_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        pid_code TEXT NOT NULL,
        pid_type TEXT NOT NULL,
        description TEXT,
        raw_value TEXT,
        decoded_value REAL,
        unit TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // 设备连接历史
      `CREATE TABLE IF NOT EXISTS device_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_address TEXT NOT NULL,
        device_name TEXT,
        connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        disconnected_at DATETIME,
        connection_duration INTEGER
      )`,
      
      // 告警记录
      `CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pid_code TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        threshold_value REAL,
        actual_value REAL,
        message TEXT,
        severity TEXT,
        acknowledged BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // 用户设置
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // 索引
      `CREATE INDEX IF NOT EXISTS idx_obd_data_timestamp ON obd_data(timestamp)`,
      `CREATE INDEX IF NOT EXISTS idx_obd_data_pid ON obd_data(pid_code)`,
      `CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at)`,
    ];

    for (const sql of tables) {
      await this.run(sql);
    }
    
    console.log('Database tables created successfully');
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Database run error:', err);
          reject(err);
        } else {
          resolve({
            lastID: this.lastID,
            changes: this.changes,
          });
        }
      });
    });
  }

  async insertOBDData(data: {
    pidCode: string;
    pidType: string;
    description?: string;
    rawValue: string;
    decodedValue: number;
    unit?: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO obd_data 
      (timestamp, pid_code, pid_type, description, raw_value, decoded_value, unit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      Date.now(),
      data.pidCode,
      data.pidType,
      data.description,
      data.rawValue,
      data.decodedValue,
      data.unit,
    ];

    const result = await this.run(sql, params);
    return result.lastID || 0;
  }

  async getOBDDataHistory(
    pidCode: string, 
    startTime: number, 
    endTime: number,
    limit: number = 1000
  ): Promise<any[]> {
    const sql = `
      SELECT * FROM obd_data 
      WHERE pid_code = ? AND timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    
    return this.query(sql, [pidCode, startTime, endTime, limit]);
  }

  async getRecentOBDData(pidCode: string, minutes: number = 60): Promise<any[]> {
    const startTime = Date.now() - (minutes * 60 * 1000);
    const sql = `
      SELECT * FROM obd_data 
      WHERE pid_code = ? AND timestamp > ?
      ORDER BY timestamp DESC
    `;
    
    return this.query(sql, [pidCode, startTime]);
  }

  async insertAlert(alert: {
    pidCode: string;
    alertType: string;
    thresholdValue?: number;
    actualValue: number;
    message: string;
    severity: string;
  }): Promise<number> {
    const sql = `
      INSERT INTO alerts 
      (pid_code, alert_type, threshold_value, actual_value, message, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      alert.pidCode,
      alert.alertType,
      alert.thresholdValue,
      alert.actualValue,
      alert.message,
      alert.severity,
    ];

    const result = await this.run(sql, params);
    return result.lastID || 0;
  }

  async getUnacknowledgedAlerts(): Promise<any[]> {
    const sql = `
      SELECT * FROM alerts 
      WHERE acknowledged = FALSE 
      ORDER BY created_at DESC
    `;
    
    return this.query(sql);
  }

  async acknowledgeAlert(alertId: number): Promise<void> {
    const sql = 'UPDATE alerts SET acknowledged = TRUE WHERE id = ?';
    await this.run(sql, [alertId]);
  }

  async setSetting(key: string, value: string): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO settings (key, value) 
      VALUES (?, ?)
    `;
    await this.run(sql, [key, value]);
  }

  async getSetting(key: string): Promise<string | null> {
    const sql = 'SELECT value FROM settings WHERE key = ?';
    const rows = await this.query(sql, [key]);
    return rows.length > 0 ? rows[0].value : null;
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close(() => {
          console.log('Database connection closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}