import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeToChatMessages, sendChatMessage } from '../../firebase/config';
import { setAdminAuthSession } from '../../hooks/useAuth';
import type { ChatMessage } from '../../types';

const ADMIN_USER = (import.meta.env.VITE_ADMIN_USER ?? 'admin').toLowerCase();
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS ?? '';

type AuthStep = 'boot' | 'username' | 'password' | 'authenticated';

function formatChatTime(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return '--:--';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

interface ConsoleLine {
  text: string;
  type: 'system' | 'input' | 'error' | 'chat' | 'image';
  username?: string;
  image?: string;
}

function compressImage(file: File, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DosConsole({ onSessionRoleChange }: { onSessionRoleChange: (isAdmin: boolean) => void }) {
  const [authStep, setAuthStep] = useState<AuthStep>('boot');
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, chatMessages, scrollToBottom]);

  // Focus input on click anywhere
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Boot sequence
  useEffect(() => {
    const bootLines: ConsoleLine[] = [
      { text: '', type: 'system' },
      { text: 'Microsoft(R) MS-DOS(R) Version 6.22', type: 'system' },
      { text: '(C)Copyright Microsoft Corp 1981-1994.', type: 'system' },
      { text: '', type: 'system' },
      { text: 'HIMEM is testing extended memory...done.', type: 'system' },
      { text: '64MB RAM OK', type: 'system' },
      { text: '', type: 'system' },
      { text: 'C:\\>chat.exe', type: 'system' },
      { text: '', type: 'system' },
      { text: '════════════════════════════════════════════', type: 'system' },
      { text: '  SISTEMA DE COMUNICACION SEGURO v2.1', type: 'system' },
      { text: '  Protocolo de acceso restringido', type: 'system' },
      { text: '════════════════════════════════════════════', type: 'system' },
      { text: '', type: 'system' },
    ];

    let i = 0;
    const timer = setInterval(() => {
      if (i < bootLines.length) {
        const nextLine = bootLines[i];
        if (nextLine) {
          setLines((prev) => [...prev, nextLine]);
        }
        i++;
      } else {
        clearInterval(timer);
        setLines((prev) => [
          ...prev,
          { text: 'Introduce tu nombre (primera letra en mayusculas):', type: 'system' },
        ]);
        setAuthStep('username');
      }
    }, 150);

    return () => clearInterval(timer);
  }, []);

  // Safety watchdog: if boot never paints (HMR/edge cases), show prompt anyway.
  useEffect(() => {
    if (authStep !== 'boot') return;
    const watchdog = setTimeout(() => {
      setLines((prev) => {
        if (prev.length > 0) return prev;
        return [
          { text: 'Microsoft(R) MS-DOS(R) Version 6.22', type: 'system' },
          { text: 'C:\\>chat.exe', type: 'system' },
          { text: '', type: 'system' },
          { text: 'Introduce tu nombre (primera letra en mayusculas):', type: 'system' },
        ];
      });
      setAuthStep('username');
    }, 2500);

    return () => clearTimeout(watchdog);
  }, [authStep]);

  // Subscribe to chat messages when authenticated
  useEffect(() => {
    if (authStep !== 'authenticated') return;
    const unsub = subscribeToChatMessages((msgs) => {
      setChatMessages(msgs);
    });
    return unsub;
  }, [authStep]);

  const addLine = useCallback((line: ConsoleLine) => {
    setLines((prev) => [...prev, line]);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = input.trim();
      if (!value) return;

      if (authStep === 'username') {
        addLine({ text: `> ${value}`, type: 'input' });
        setInput('');

        // Check admin user (case-insensitive)
        if (value.toLowerCase() === ADMIN_USER) {
          setIsAdmin(true);
          addLine({ text: '', type: 'system' });
          addLine({
            text: 'Fecha de nacimiento con formato DD/MM/YYYY:',
            type: 'system',
          });
          setAuthStep('password');
          return;
        }

        // Check non-admin user (exact match)
        if (value === 'Ignacio') {
          setIsAdmin(false);
          addLine({ text: '', type: 'system' });
          addLine({
            text: 'Fecha de nacimiento con formato DD/MM/YYYY:',
            type: 'system',
          });
          setAuthStep('password');
          return;
        }

        addLine({ text: 'ERROR: Usuario no reconocido.', type: 'error' });
        addLine({ text: '', type: 'system' });
        addLine({
          text: 'Introduce tu nombre (primera letra en mayusculas):',
          type: 'system',
        });
        return;
      }

      if (authStep === 'password') {
        // Mask password only when admin username was provided.
        addLine({ text: `> ${isAdmin ? '*'.repeat(value.length) : value}`, type: 'input' });
        setInput('');

        const isValidAdmin = isAdmin && value === ADMIN_PASS;
        const isValidUser = !isAdmin && value === '27/07/1991';

        if (isValidAdmin || isValidUser) {
          onSessionRoleChange(isValidAdmin);
          setAdminAuthSession(isValidAdmin);
          const displayName = isAdmin ? 'Usuario Desconocido' : 'Ignacio';
          setUsername(displayName);
          addLine({ text: '', type: 'system' });
          addLine({ text: '════════════════════════════════════════════', type: 'system' });
          addLine({ text: `  Acceso concedido. Bienvenido, ${displayName}.`, type: 'system' });
          addLine({ text: '  Escriba su mensaje y pulse ENTER para enviar.', type: 'system' });
          addLine({ text: '════════════════════════════════════════════', type: 'system' });
          addLine({ text: '', type: 'system' });
          setAuthStep('authenticated');
          return;
        }

        addLine({ text: 'ERROR: Datos incorrectos.', type: 'error' });
        addLine({ text: '', type: 'system' });
        addLine({
          text: 'Fecha de nacimiento con formato DD/MM/YYYY:',
          type: 'system',
        });
        return;
      }

      if (authStep === 'authenticated') {
        setInput('');
        sendChatMessage({
          username,
          text: value,
          timestamp: Date.now(),
        });
      }
    },
    [input, authStep, isAdmin, username, addLine, onSessionRoleChange]
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || authStep !== 'authenticated') return;

      try {
        const compressed = await compressImage(file);
        sendChatMessage({
          username,
          text: '',
          image: compressed,
          timestamp: Date.now(),
        });
      } catch {
        // silently fail
      }
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [authStep, username]
  );

  const isPasswordStep = authStep === 'password';

  return (
    <div
      className="dos-console"
      onClick={focusInput}
    >
      {/* CRT scanline overlay */}
      <div className="dos-scanlines" />
      <div className="dos-flicker" />

      <div ref={terminalRef} className="dos-terminal">
        {/* Boot / auth lines */}
        {lines.filter(Boolean).map((line, i) => (
          <div key={i} className={`dos-line ${line.type === 'error' ? 'dos-error' : ''} ${line.type === 'input' ? 'dos-input-line' : ''}`}>
            {line.text || '\u00A0'}
          </div>
        ))}

        {/* Chat messages (only after auth) */}
        {authStep === 'authenticated' &&
          chatMessages.map((msg) => (
            <div key={msg.id || `${msg.username}-${msg.timestamp}`} className="dos-chat-msg">
              <span className="dos-chat-user">
                [{formatChatTime(msg.timestamp)}] {msg.username || 'Usuario'}:
              </span>{' '}
              {msg.image ? (
                <div className="dos-chat-image-wrap">
                  <img src={msg.image} alt="foto" className="dos-chat-image" />
                </div>
              ) : (
                <span className="dos-chat-text">{msg.text}</span>
              )}
            </div>
          ))}

        {/* Input line */}
        {authStep !== 'boot' && (
          <div className="dos-input-row">
            {authStep === 'authenticated' && (
              <span className="dos-prompt">{username}&gt; </span>
            )}
            {authStep !== 'authenticated' && (
              <span className="dos-prompt">&gt; </span>
            )}
            <form onSubmit={handleSubmit} className="dos-form">
              <input
                ref={inputRef}
                type={isPasswordStep && isAdmin ? 'password' : 'text'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="dos-input"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <span className="dos-cursor">█</span>
            </form>
            {/* Photo button for non-admin authenticated users */}
            {authStep === 'authenticated' && !isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="dos-photo-btn"
                  title="Enviar foto"
                >
                  [IMG]
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
