import React from 'react';

export function LoggingPanel(logs: string[]): React.ReactNode {
  return logs.map((log, index) => <div key={index}>{log}</div>);
}
