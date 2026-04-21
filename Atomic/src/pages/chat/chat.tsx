import Header from '../../components/header/header';
import styles from './chat.module.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useEffect, useState, useRef } from 'react';
import { useRecord } from '../../hooks/useRecord';
import { useSocket } from '../../hooks/useSocket';
import { useUser } from '../../hooks/useUser';

// record collection: from = "user" (WhatsApp client) | "assistant" (IA)
interface RecordMessage {
  from: 'user' | 'assistant' | 'operator';
  text: string;
}

interface Record {
  _id: string;
  userId: string;
  clientId: string;
  clientName: string | null;
  clientPhone: string | null;
  messages: RecordMessage[];
  updateDate: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

export default function Chat() {
  const session = useSelector((state: RootState) => state.user.session);
  const { records, setRecords, getRecords, getRecord, addMessage } = useRecord();
  const { connected, joinRoom, onReceiveMessage } = useSocket();
  const { toggleIA, getIAState } = useUser();

  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [messages, setMessages] = useState<RecordMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [iaActive, setIaActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = session?.id;
    if (id) {
      getRecords(id).then((loaded: Record[]) => {
        if (loaded && loaded.length > 0 && !selectedRecord) loadRecord(loaded[0]);
      });
      joinRoom(id);
      getIAState(id).then(r => setIaActive(r.ia));
    }
  }, [session?.id, connected]);

  // Escuchar mensajes en tiempo real vía Socket.IO
  useEffect(() => {
    onReceiveMessage((data: any) => {
      const match = records.find((r: Record) => r.userId === data.from);
      if (match) moveToTop(match);
      if (selectedRecord && data.from === selectedRecord.userId) {
        setMessages(prev => [...prev, { from: 'user', text: data.message }]);
      }
    });
  }, [selectedRecord, records]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRecord = async (record: Record) => {
    setMessages([]);
    setSelectedRecord(record);
    const full = await getRecord(session.id, record.userId);
    if (full && full.messages) {
      setMessages(full.messages);
    }
  };

  const handleToggleIA = async () => {
    const result = await toggleIA(session.id);
    if (result) setIaActive(result.ia);
  };

  const moveToTop = (record: Record) => {
    setRecords(prev => [record, ...prev.filter(r => r._id !== record._id)]);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedRecord) return;
    const text = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { from: 'operator', text }]);
    moveToTop(selectedRecord);
    await addMessage(session.id, selectedRecord.userId, text);
  };

  // Previsualización del último mensaje en el sidebar
  const getPreview = (record: Record) => {
    if (!record.messages || record.messages.length === 0) return 'Sin mensajes';
    const last = record.messages[record.messages.length - 1];
    const prefix = last.from === 'assistant' ? 'IA: ' : '';
    return prefix + (last.text.length > 40 ? last.text.slice(0, 40) + '…' : last.text);
  };

  // Nombre a mostrar cuando no hay clientName
  const displayName = (record: Record) =>
    record.clientName || record.clientPhone || record.userId || 'Cliente';

  return (
    <>
      <Header />
      <section className={styles.chatContainer}>

        {/* ─── SIDEBAR ─── */}
        <div className={styles.conversationsList}>
          <p className={styles.header}>Conversaciones</p>

          {records.length === 0 ? (
            <div className={styles.emptyState}>Sin registros</div>
          ) : (
            records.map((record: Record) => (
              <div
                key={record._id}
                className={`${styles.conversationItem} ${selectedRecord?._id === record._id ? styles.active : ''}`}
                onClick={() => loadRecord(record)}
              >
                {/* Avatar inicial */}
                <div className={styles.conversationAvatar}>
                  {displayName(record).charAt(0).toUpperCase()}
                </div>
                <div className={styles.conversationMeta}>
                  <div className={styles.conversationTopRow}>
                    <span className={styles.conversationName}>{displayName(record)}</span>
                    <span className={styles.conversationTime}>{formatDate(record.updateDate)}</span>
                  </div>
                  {record.clientPhone && (
                    <div className={styles.conversationPhone}>{record.clientPhone}</div>
                  )}
                  <div className={styles.conversationPreview}>{getPreview(record)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ─── CHAT VIEW ─── */}
        <div className={styles.chatView}>
          {selectedRecord ? (
            <>
              {/* Header del chat */}
              <div className={styles.chatHeader}>
                <div className={styles.clientInfo}>
                  <div className={styles.clientAvatar}>
                    {displayName(selectedRecord).charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.clientDetails}>
                    <div className={styles.clientName}>{displayName(selectedRecord)}</div>
                    {selectedRecord.clientPhone && (
                      <div className={styles.clientPhone}>{selectedRecord.clientPhone}</div>
                    )}
                  </div>
                </div>
                <button
                  className={`${styles.toggleIAButton} ${iaActive ? styles.toggleIAActive : styles.toggleIABlocked}`}
                  onClick={handleToggleIA}
                >
                  {iaActive ? 'IA Activa' : 'IA Bloqueada'}
                </button>
              </div>

              {/* Mensajes */}
              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.emptyState}>Sin mensajes</div>
                ) : (
                  messages.map((msg, idx) => {
                    const side = msg.from === 'user' ? 'client' : 'user';
                    const label = msg.from === 'assistant' ? 'IA' : msg.from === 'operator' ? 'Propietario' : null;
                    return (
                      <div key={idx} className={`${styles.message} ${styles[side]}`}>
                        <div className={`${styles.messageBubble} ${styles[side]}`}>
                          <div className={styles.messageText}>{msg.text}</div>
                          {label && <div className={styles.messageLabel}>{label}</div>}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className={styles.inputContainer}>
                <textarea
                  className={styles.messageInput}
                  placeholder={iaActive ? 'La IA está gestionando esta conversación…' : 'Escribe una respuesta...'}
                  value={inputValue}
                  disabled={iaActive}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                />
                <button
                  className={styles.sendButton}
                  disabled={iaActive || !inputValue.trim()}
                  onClick={handleSend}
                >
                  Enviar
                </button>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Selecciona una conversación</p>
            </div>
          )}
        </div>

      </section>
    </>
  );
}
