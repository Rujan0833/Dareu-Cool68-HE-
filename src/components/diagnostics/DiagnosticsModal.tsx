import React, { useEffect, useState } from 'react';
import { hidTransport, PacketLogEntry } from '../../device/hidTransport';
import { cool68Service } from '../../device/cool68Service';
import { X, Play, Trash2, Terminal, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<PacketLogEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'TX' | 'RX'>('ALL');
  const [isPinging, setIsPinging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setLogs(hidTransport.getLogs());
    }, 400);

    setLogs(hidTransport.getLogs());
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = logs.filter(l => filter === 'ALL' || l.direction === filter);

  const handleTestPing = async () => {
    setIsPinging(true);
    try {
      await cool68Service.fetchDeviceInfo();
      setLogs(hidTransport.getLogs());
    } catch (err: any) {
      console.error('Test query failed:', err);
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-atk-card border border-atk-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col h-[75vh]">
        {/* Header */}
        <div className="p-4 border-b border-atk-border bg-atk-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-atk-orange" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              WebHID Hardware Protocol Diagnostics
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-atk-hover border border-atk-border font-mono text-zinc-400">
              VID 0x372E : PID 0x1083
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-atk-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-atk-border bg-atk-surface/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-mono text-[11px]">Filter:</span>
            {(['ALL', 'TX', 'RX'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  filter === f
                    ? 'bg-atk-orange text-white'
                    : 'text-zinc-400 hover:text-zinc-200 bg-atk-hover'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestPing}
              disabled={isPinging || !hidTransport.isConnected()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-atk-hover hover:bg-zinc-700 text-zinc-200 border border-atk-border font-medium disabled:opacity-50 transition-colors"
            >
              <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
              <span>Query Hardware</span>
            </button>

            <button
              onClick={() => {
                hidTransport.clearLogs();
                setLogs([]);
              }}
              className="p-1.5 rounded-lg bg-atk-hover hover:bg-zinc-700 text-zinc-400 hover:text-red-400 border border-atk-border transition-colors"
              title="Clear Packet Log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Log Viewer */}
        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#0a0a0e]">
          {filtered.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-600 italic">
              No HID reports logged yet. Connect device or send a query.
            </div>
          ) : (
            filtered.map((log, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border flex items-start justify-between gap-4 ${
                  log.direction === 'TX'
                    ? 'bg-atk-card/50 border-cyan-500/20 text-cyan-200'
                    : 'bg-atk-card/50 border-emerald-500/20 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {log.direction === 'TX' ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      <ArrowUpRight className="w-3 h-3" /> TX
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      <ArrowDownLeft className="w-3 h-3" /> RX
                    </span>
                  )}
                  <span className="text-zinc-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-zinc-300">
                    cmd: 0x{log.cmd.toString(16).padStart(2, '0').toUpperCase()} sub: 0x{log.sub.toString(16).padStart(2, '0').toUpperCase()}
                  </span>
                </div>

                <div className="text-right text-zinc-400 text-[11px] truncate max-w-sm">
                  {log.hex}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-atk-border bg-atk-surface text-[11px] text-zinc-500 flex items-center justify-between font-mono">
          <span>Connected: {hidTransport.isConnected() ? 'YES' : 'NO'}</span>
          <span>Logged: {filtered.length} packets</span>
        </div>
      </div>
    </div>
  );
};
