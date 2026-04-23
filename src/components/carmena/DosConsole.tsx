import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeToChatMessages, sendChatMessage, subscribeToFirebaseError, subscribeToPresence, setUserPresence, isFirebaseConfigured, missingFirebaseEnvKeys } from '../../firebase/config';
import { setAdminAuthSession } from '../../hooks/useAuth';
import type { ChatMessage } from '../../types';

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

// Secure credential validation (timing-safe comparison to prevent timing attacks)
function constantTimeCompare(a: string, b: string): boolean {
  const aLength = (a || '').length;
  const bLength = (b || '').length;
  
  if (aLength !== bLength) {
    // Still compare to avoid timing leak on length
    const minLength = Math.min(aLength, bLength);
    let result = 0;
    for (let i = 0; i < minLength; i++) {
      result |= (a?.charCodeAt(i) || 0) ^ (b?.charCodeAt(i) || 0);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < aLength; i++) {
    result |= (a?.charCodeAt(i) || 0) ^ (b?.charCodeAt(i) || 0);
  }
  return result === 0;
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
  const prevConnectedAtRef = useRef<number | null>(null);

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

  // Subscribe to Ignacio's presence (admin only)
  useEffect(() => {
    if (!isAdmin || authStep !== 'authenticated') return;
    const unsub = subscribeToPresence((presence) => {
      const connectedAt = presence?.connectedAt ?? null;
      const isOnline = presence?.online === true;
      if (
        isOnline &&
        connectedAt !== null &&
        prevConnectedAtRef.current !== null &&
        connectedAt !== prevConnectedAtRef.current
      ) {
        const authUser2 = import.meta.env.VITE_AUTH_USER_2 || 'Ignacio';
        setLines((prev) => [
          ...prev,
          { text: '', type: 'system' },
          { text: `*** ${authUser2} se ha conectado al chat ***`, type: 'system' },
          { text: '', type: 'system' },
        ]);
      }
      if (connectedAt !== null) prevConnectedAtRef.current = connectedAt;
    });
    return unsub;
  }, [isAdmin, authStep]);

  // Subscribe to chat messages when authenticated
  useEffect(() => {
    if (authStep !== 'authenticated') return;

    if (!isFirebaseConfigured) {
      const missingKeys = missingFirebaseEnvKeys.join(', ');
      setLines((prev) => [
        ...prev,
        { text: '', type: 'system' },
        { text: '! AVISO: Firebase no configurado. Modo local activo.', type: 'error' },
        { text: `! Variables faltantes: ${missingKeys || 'desconocidas'}`, type: 'error' },
        { text: '! Los mensajes NO se comparten entre dispositivos.', type: 'error' },
        { text: '', type: 'system' },
      ]);
    }

    const unsubError = subscribeToFirebaseError((code) => {
      if (code === 'PERMISSION_DENIED') {
        setLines((prev) => [
          ...prev,
          { text: '', type: 'system' },
          { text: '! ERROR FIREBASE: Acceso denegado (PERMISSION_DENIED).', type: 'error' },
          { text: '! Revisa las reglas de seguridad de Firebase Realtime Database.', type: 'error' },
          { text: '! Los mensajes NO se comparten entre dispositivos hasta que se corrija.', type: 'error' },
          { text: '', type: 'system' },
        ]);
      }
    });

    const unsub = subscribeToChatMessages((msgs) => {
      setChatMessages(msgs);
    });

    return () => {
      unsubError();
      unsub();
    };
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

        const authUser1 = import.meta.env.VITE_AUTH_USER_1 || '';
        const authUser2 = import.meta.env.VITE_AUTH_USER_2 || '';

        // Check first user (case-insensitive, but trim first for robustness)
        if (constantTimeCompare(value.toLowerCase().trim(), authUser1.toLowerCase())) {
          setIsAdmin(true);
          addLine({ text: '', type: 'system' });
          addLine({
            text: 'Contraseña:',
            type: 'system',
          });
          setAuthStep('password');
          return;
        }

        // Check second user (exact match after trim for robustness)
        if (constantTimeCompare(value.trim(), authUser2)) {
          setIsAdmin(false);
          addLine({ text: '', type: 'system' });
          addLine({
            text: 'Fecha de nacimiento con formato DD/MM/YYYY:',
            type: 'system',
          });
          setAuthStep('password');
          return;
        }

        // Generic error message for security
        addLine({ text: 'ERROR: Credenciales inválidas.', type: 'error' });
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

        const authCred1 = import.meta.env.VITE_AUTH_CRED_1 || '';
        const authCred2 = import.meta.env.VITE_AUTH_CRED_2 || '';

        // Use timing-safe comparison to prevent timing attacks
        const isValidAdmin = isAdmin && constantTimeCompare(value, authCred1);
        const isValidUser2 = !isAdmin && constantTimeCompare(value, authCred2);

        if (isValidAdmin || isValidUser2) {
          onSessionRoleChange(isValidAdmin);
          setAdminAuthSession(isValidAdmin);
          if (isValidUser2) setUserPresence();
          const authUser2 = import.meta.env.VITE_AUTH_USER_2 || '';
          const displayName = isAdmin ? 'Usuario Desconocido' : authUser2;
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

        // Generic error message for security (don't reveal which field is wrong)
        addLine({ text: 'ERROR: Credenciales inválidas.', type: 'error' });
        addLine({ text: '', type: 'system' });
        addLine({
          text: isAdmin ? 'Contraseña:' : 'Fecha de nacimiento con formato DD/MM/YYYY:',
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

  // Auto-format date input DD/MM/YYYY — appends '/' immediately after 2nd and 4th digit
  const formatDateInput = (value: string, isDeleting: boolean): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length < 2) return digits;
    if (digits.length === 2) return isDeleting ? digits : `${digits}/`;
    if (digits.length < 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length === 4) return isDeleting ? `${digits.slice(0, 2)}/${digits.slice(2)}` : `${digits.slice(0, 2)}/${digits.slice(2)}/`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  };

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
              <span className={msg.username === 'Ignacio' ? 'dos-chat-user-ignacio' : 'dos-chat-user-admin'}>
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
                onChange={(e) => {
                  if (isPasswordStep && !isAdmin) {
                    const isDeleting = e.target.value.length < input.length;
                    setInput(formatDateInput(e.target.value, isDeleting));
                  } else {
                    setInput(e.target.value);
                  }
                }}
                className="dos-input"
                style={{ width: `${input.length}ch` }}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <span className="dos-cursor">█</span>
            </form>
            {/* Photo button for all authenticated users */}
            {authStep === 'authenticated' && (
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
