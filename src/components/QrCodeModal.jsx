import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

export function QrCodeModal({ 
  show, 
  onClose, 
  roomId, 
  copySuccess, 
  onCopyLink 
}) {
  const canvasRef = useRef(null);
  const roomUrl = `${window.location.origin}${window.location.pathname}#room=${roomId}`;

  useEffect(() => {
    if (show && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        roomUrl,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [show, roomUrl]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-base"
        >
          ✕
        </button>

        <div className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Scan to Join Room</h3>
        </div>

        <p className="text-xs text-slate-400">
          Point your phone camera at this QR code to join this countdown session live!
        </p>

        {/* QR Code Canvas */}
        <div className="flex justify-center bg-white p-4 rounded-2xl shadow-inner mx-auto w-fit">
          <canvas ref={canvasRef} />
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono text-cyan-300 truncate">
          {roomUrl}
        </div>

        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={onCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Share Link</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
