import React, { useState } from 'react';
import { Button, ConfigProvider, Input, Progress, message, QRCode, Upload, UploadFile } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, CheckOutlined, CloseOutlined, CopyOutlined, FileOutlined, KeyOutlined, LinkOutlined, MessageOutlined, RadarChartOutlined, SendOutlined, UploadOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { changeDisplayName, startPeer, stopPeer } from "./store/peer/peerActions";
import * as connectionAction from "./store/connection/connectionActions"
import { acceptPeer, declinePeer, findNearby, joinCodeRoom, requestPeer } from "./store/discovery/discoveryActions";
import { addHistoryEntry } from "./store/history/historyActions";
import { Transport } from "./helpers/transport";
import { loadDisplayName } from "./helpers/displayName";
import { useAsyncState } from "./helpers/hooks";
import { useParams } from "react-router-dom"
import "./share.css";

function getUrlPrefix() {
    return window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1)
}

function formatTime(at: number) {
    return new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const App: React.FC = () => {
    const { shareId } = useParams();

    const peer = useAppSelector((state) => state.peer)
    const connection = useAppSelector((state) => state.connection)
    const history = useAppSelector((state) => state.history)
    const discovery = useAppSelector((state) => state.discovery)
    const dispatch = useAppDispatch()

    const nameOf = (peerId: string) => discovery.names[peerId] ?? peerId.slice(0, 8)
    const viaLabel = (via: string) => via === 'nearby' ? 'Nearby' : via === 'code' ? 'Code' : 'Link'

    const [nameInput, setNameInput] = useState(() => loadDisplayName())
    const [codeInput, setCodeInput] = useState("")

    const handleStartSession = () => {
        dispatch(changeDisplayName(nameInput))
        dispatch(startPeer())
            .then(function () {
                if (shareId) {
                    dispatch(connectionAction.changeConnectionInput(shareId))
                }
            })
    }

    const handleStopSession = async () => {
        await dispatch(stopPeer())
    }

    const handleConnectOtherPeer = () => {
        connection.id != null ? dispatch(connectionAction.connectPeer(connection.id || "")) : message.warning("Please enter ID")
    }

    const [fileList, setFileList] = useAsyncState([] as UploadFile[])
    const [sendLoading, setSendLoading] = useAsyncState(false)
    const [msgToSend, setMsgToSend] = useAsyncState("")
    const [sendProgress, setSendProgress] = useState<number | null>(null)

    const handleUpload = async (kind: 'file' | 'msg') => {
        if (!connection.selectedId) {
            message.warning("Please select a connection")
            return
        }
        const peerId = connection.selectedId
        const peerLabel = nameOf(peerId)

        try {
            if (kind === 'file') {
                if (fileList.length === 0) {
                    message.warning("Please select file")
                    return
                }
                const file = fileList[0] as unknown as File;
                const data = await file.arrayBuffer()
                await setSendLoading(true);
                setSendProgress(0)
                await Transport.sendFile(peerId, data, { name: file.name, size: file.size, type: file.type },
                    (percent) => setSendProgress(Math.round(percent * 100)))
                dispatch(addHistoryEntry('sent-file', file.name, peerLabel))
                setFileList([])
            } else {
                if (msgToSend.length === 0) {
                    message.warning("Please write a message")
                    return
                }
                await setSendLoading(true);
                await Transport.sendMessage(peerId, msgToSend)
                dispatch(addHistoryEntry('sent-msg', msgToSend, peerLabel))
                setMsgToSend("")
            }
            await setSendLoading(false)
            setSendProgress(null)
        } catch (err) {
            await setSendLoading(false)
            setSendProgress(null)
            console.log(err)
            message.error(String(err))
        }
    }

    const isConnected = connection.list.length > 0
    const status = !peer.started
        ? { label: 'Not started', cls: '' }
        : !isConnected
            ? { label: 'Listening…', cls: 'is-listening' }
            : { label: `Connected to ${connection.list.length} device${connection.list.length === 1 ? '' : 's'}`, cls: 'is-live' }
    const unconnected = discovery.discovered.filter(p => !connection.list.includes(p.peerId))

    return (
        <ConfigProvider theme={{
            token: {
                colorPrimary: '#0f6eaa',
                colorLink: '#0f6eaa',
                colorText: '#1b2a38',
                colorTextSecondary: '#5b7285',
                colorError: '#974a63',
                colorTextPlaceholder: '#5b7285',
                colorBgLayout: '#d9eaf5',
                borderRadius: 16,
                fontFamily: '"Nunito", ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            }
        }}>
            <main className="deck-page">
                <header className="deck-header">
                    <span className="deck-avatar" aria-hidden="true">{(peer.displayName || nameInput || 'P').trim().charAt(0).toUpperCase()}</span>
                    <div className="deck-title-block">
                        <h1 className="deck-title">P2P File Transfer</h1>
                    </div>
                    <span className={`deck-status ${status.cls}`} role="status">
                        <span className="deck-dot-signal" aria-hidden="true" />
                        {status.label}
                    </span>
                </header>
                <p className="deck-tagline">Send a file straight to the phone next to you. No server, no upload. It goes direct.</p>

                {!peer.started && (
                    <section className="deck-start-panel" aria-label="Start a session">
                        <p>Start a session and your ID and QR code appear here. The other phone scans it, connects, and you send.</p>
                        <label className="deck-name-label" htmlFor="displayName">Your name on the other phone</label>
                        <Input
                            id="displayName"
                            value={nameInput}
                            maxLength={24}
                            onChange={e => setNameInput(e.target.value)}
                            aria-label="Your display name"
                        />
                        <Button type="primary" size="large" onClick={handleStartSession} loading={peer.loading}>Start session</Button>
                    </section>
                )}

                {peer.started && (
                    <ol className="deck-steps">
                        <li className={`deck-step ${peer.started ? 'is-done' : ''}`}>
                            <div className="deck-step-head">
                                <span className="deck-step-chip deck-step-chip-step-1" aria-hidden="true">{peer.started ? <CheckOutlined /> : '1'}</span>
                                <h2 className="deck-step-title">Your code</h2>
                            </div>
                            <div className="deck-step-body">
                                <p className="deck-step-hint">This is your address. The other phone scans the code, or opens your link.</p>
                                <div className="deck-qr-panel">
                                    <div className="deck-qr-card">
                                        <QRCode value={getUrlPrefix() + (peer.id || "")} size={216} bordered={false} />
                                    </div>
                                    <p className="deck-id-label">Your ID</p>
                                    <p className="deck-id">{peer.id}</p>
                                    <p className="deck-id-label">Appearing as</p>
                                    <p className="deck-display-name">{peer.displayName}</p>
                                    <Button type="primary" onClick={async () => {
                                        await navigator.clipboard.writeText((getUrlPrefix() + peer.id) || "")
                                        message.info("Copied: " + getUrlPrefix() + peer.id)
                                    }} icon={<CopyOutlined />}>Copy link</Button>
                                    <div>
                                        <Button type="text" className="deck-stop" danger onClick={handleStopSession}>Stop session</Button>
                                    </div>
                                </div>
                            </div>
                        </li>

                        <li className={`deck-step ${isConnected ? 'is-done' : 'is-now'}`}>
                            <div className="deck-step-head">
                                <span className="deck-step-chip deck-step-chip-step-2" aria-hidden="true">{isConnected ? <CheckOutlined /> : '2'}</span>
                                <h2 className="deck-step-title">Connect</h2>
                            </div>
                            <div className="deck-step-body">
                                <p className="deck-step-hint">Find the other phone nearby, join the same code, or paste its ID, then tap it and wait for the other side to accept.</p>
                                <figure className="deck-exchange">
                                    <svg className="deck-exchange-art" viewBox="0 0 300 96" aria-hidden="true">
                                        <g transform="rotate(-8 28 22)">
                                            <rect x="18" y="10" width="20" height="24" rx="4" style={{ fill: 'var(--deck-file-yellow)' }} />
                                            <rect x="22" y="16" width="12" height="2.5" rx="1.25" fill="#ffffff" opacity="0.85" />
                                            <rect x="22" y="21" width="12" height="2.5" rx="1.25" fill="#ffffff" opacity="0.85" />
                                        </g>
                                        <g transform="rotate(8 272 20)">
                                            <rect x="262" y="8" width="20" height="24" rx="4" style={{ fill: 'var(--deck-ready)' }} />
                                            <rect x="266" y="14" width="12" height="2.5" rx="1.25" fill="#ffffff" opacity="0.85" />
                                            <rect x="266" y="19" width="12" height="2.5" rx="1.25" fill="#ffffff" opacity="0.85" />
                                        </g>
                                        <g transform="rotate(-4 150 14)">
                                            <rect x="140" y="2" width="20" height="24" rx="4" style={{ fill: 'var(--deck-file-purple)' }} />
                                            <rect x="144" y="8" width="12" height="2.5" rx="1.25" fill="#ffffff" opacity="0.85" />
                                            <rect x="144" y="13" width="12" height="2.5" rx="1.25" fill="#ffffff" opacity="0.85" />
                                        </g>
                                        <rect x="36" y="30" width="58" height="58" rx="12" fill="#ffffff" style={{ stroke: 'var(--deck-send)' }} strokeWidth="2.5" />
                                        <rect x="46" y="42" width="38" height="6" rx="3" style={{ fill: 'var(--deck-send-soft)' }} />
                                        <rect x="46" y="54" width="26" height="6" rx="3" style={{ fill: 'var(--deck-send-soft)' }} />
                                        <rect x="206" y="30" width="58" height="58" rx="12" fill="#ffffff" style={{ stroke: 'var(--deck-receive)' }} strokeWidth="2.5" />
                                        <rect x="216" y="42" width="38" height="6" rx="3" style={{ fill: 'var(--deck-receive-soft)' }} />
                                        <rect x="216" y="54" width="26" height="6" rx="3" style={{ fill: 'var(--deck-receive-soft)' }} />
                                        <g className="deck-exchange-arrow-blue">
                                            <path d="M 98 38 C 128 18, 172 18, 198 34" fill="none" style={{ stroke: 'var(--deck-send)' }} strokeWidth="3" strokeLinecap="round" />
                                            <path d="M 202 36 L 189 29 L 192 43 Z" style={{ fill: 'var(--deck-send)' }} />
                                        </g>
                                        <g className="deck-exchange-arrow-pink">
                                            <path d="M 202 72 C 172 90, 128 90, 102 76" fill="none" style={{ stroke: 'var(--deck-receive)' }} strokeWidth="3" strokeLinecap="round" />
                                            <path d="M 98 74 L 111 67 L 108 81 Z" style={{ fill: 'var(--deck-receive)' }} />
                                        </g>
                                    </svg>
                                    <figcaption className="deck-exchange-caption">The file goes straight across</figcaption>
                                </figure>
                                    {discovery.incoming.length > 0 && (
                                        <div className="deck-requests" role="group" aria-label="Connection requests">
                                            {discovery.incoming.map(req => (
                                                <div key={req.peerId} className="deck-request">
                                                    <span className="deck-request-text"><strong>{req.name}</strong> wants to connect</span>
                                                    <div className="deck-request-actions">
                                                        <Button type="primary" onClick={() => dispatch(acceptPeer(req.peerId))}>Accept</Button>
                                                        <Button onClick={() => dispatch(declinePeer(req.peerId))} icon={<CloseOutlined />}>Decline</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="deck-method">
                                        <h3 className="deck-connect-title"><span className="deck-connect-icon deck-connect-icon-blue"><RadarChartOutlined /></span> Nearby devices</h3>
                                        <p className="deck-note deck-note-tight">Uses your approximate area only, never your exact location.</p>
                                        <Button
                                            block
                                            onClick={() => dispatch(findNearby())}
                                            loading={discovery.nearbyLocating}
                                            disabled={discovery.nearbyActive}
                                            icon={<RadarChartOutlined />}
                                        >
                                            {discovery.nearbyActive ? 'Looking for devices nearby…' : 'Find nearby devices'}
                                        </Button>
                                        {discovery.nearbyError && <p className="deck-error" role="alert">{discovery.nearbyError}</p>}
                                    </div>

                                    <div className="deck-method">
                                        <h3 className="deck-connect-title"><span className="deck-connect-icon deck-connect-icon-pink"><KeyOutlined /></span> Join with a code</h3>
                                        <div className="deck-row">
                                            <Input
                                                placeholder="4–6 letter code"
                                                value={codeInput}
                                                maxLength={6}
                                                onChange={e => setCodeInput(e.target.value)}
                                                aria-label="Short code"
                                            />
                                            <Button onClick={() => { dispatch(joinCodeRoom(codeInput)); setCodeInput("") }}>Join</Button>
                                        </div>
                                        {discovery.codeRoom && <p className="deck-note">In code room “{discovery.codeRoom}”. The other phone enters the same code.</p>}
                                    </div>

                                    <div className="deck-method">
                                        <h3 className="deck-connect-title"><span className="deck-connect-icon deck-connect-icon-green"><LinkOutlined /></span> Paste an ID or link code</h3>
                                        <div className="deck-row">
                                            <Input
                                                placeholder="Phone ID"
                                                value={connection.id}
                                                onChange={e => dispatch(connectionAction.changeConnectionInput(e.target.value))}
                                                required={true}
                                                aria-label="Other phone's ID"
                                            />
                                            <Button type="primary" onClick={handleConnectOtherPeer} loading={connection.loading}>Connect</Button>
                                        </div>
                                    </div>

                                    {unconnected.length > 0 && (
                                        <div className="deck-peer-list" style={{ marginTop: 16 }}>
                                            {unconnected.map(found => {
                                                const requested = discovery.outgoing.includes(found.peerId)
                                                return (
                                                    <button
                                                        key={found.peerId}
                                                        type="button"
                                                        className="deck-peer deck-peer-stacked"
                                                        disabled={requested}
                                                        onClick={() => dispatch(requestPeer(found.peerId))}
                                                    >
                                                        <span className="deck-peer-top">
                                                            <span className="deck-peer-name">{found.name}</span>
                                                            <span className="deck-peer-via">{viaLabel(found.via)}</span>
                                                        </span>
                                                        <span className="deck-peer-bottom">
                                                            <span className="deck-peer-id">{found.peerId.slice(0, 8)}</span>
                                                            <span className="deck-peer-state">{requested ? 'Request sent…' : 'Tap to connect'}</span>
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {connection.list.length === 0 ? (
                                        <p className="deck-note">
                                            {unconnected.length === 0 && <><span className="deck-dot-signal" aria-hidden="true" /> Listening for a device…</>}
                                        </p>
                                    ) : (
                                        <div className="deck-peer-list" style={{ marginTop: 12 }}>
                                            {connection.list.map(peerId => (
                                                <button
                                                    key={peerId}
                                                    type="button"
                                                    className={`deck-peer deck-peer-stacked ${connection.selectedId === peerId ? 'is-selected' : ''}`}
                                                    aria-pressed={connection.selectedId === peerId}
                                                    onClick={() => dispatch(connectionAction.selectItem(peerId))}
                                                >
                                                    <span className="deck-peer-top">
                                                        <span className="deck-peer-name">{nameOf(peerId)}</span>
                                                    </span>
                                                    <span className="deck-peer-bottom">
                                                        <span className="deck-peer-id">{peerId.slice(0, 8)}</span>
                                                        <span className="deck-peer-state">Connected</span>
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </li>

                        <li className={`deck-step ${history.entries.length > 0 ? 'is-done' : isConnected ? 'is-now' : ''}`}>
                            <div className="deck-step-head">
                                <span className="deck-step-chip deck-step-chip-step-3" aria-hidden="true">{history.entries.length > 0 ? <CheckOutlined /> : '3'}</span>
                                <h2 className="deck-step-title">Send</h2>
                            </div>
                            <div className="deck-step-body">
                                <p className="deck-step-hint">
                                    {connection.selectedId
                                        ? <>Sending to <span style={{ display: 'inline', wordBreak: 'break-all' }}>{nameOf(connection.selectedId)}</span>. Pick a file or write a message.</>
                                        : 'Connect to a device first, then pick a file or write a message.'}
                                </p>
                                    {discovery.receiving && (
                                        <p className="deck-note deck-note-tight" role="status">
                                            Receiving {discovery.receiving.name}… {discovery.receiving.percent}%
                                        </p>
                                    )}
                                    <div className={`deck-file-zone ${fileList.length > 0 ? 'has-file' : ''}`}>
                                        {fileList.length > 0 ? (
                                            <>
                                                <span className="deck-file-name"><FileOutlined /> {(fileList[0] as unknown as File).name}</span>
                                                <Button type="primary" onClick={() => handleUpload('file')} loading={sendLoading} icon={<SendOutlined />}>
                                                    {sendLoading ? 'Sending…' : 'Send file'}
                                                </Button>
                                                {sendProgress !== null && (
                                                    <div className="deck-progress">
                                                        <Progress percent={sendProgress} status="active" />
                                                    </div>
                                                )}
                                                <div style={{ marginTop: 8 }}>
                                                    <Button type="link" onClick={() => setFileList([])}>Remove file</Button>
                                                </div>
                                            </>
                                        ) : (
                                            <Upload fileList={[]}
                                                maxCount={1}
                                                showUploadList={false}
                                                beforeUpload={(file) => {
                                                    setFileList([file])
                                                    return false
                                                }}>
                                                <Button icon={<UploadOutlined />}>Select a file</Button>
                                            </Upload>
                                        )}
                                    </div>
                                    <div className="deck-divider">Or</div>
                                    <div className="deck-msg-row">
                                        <Input
                                            placeholder="Write a message"
                                            value={msgToSend}
                                            onChange={e => setMsgToSend(e.target.value)}
                                            required={true}
                                            aria-label="Message to send"
                                        />
                                        <Button
                                            type="primary"
                                            onClick={() => handleUpload('msg')}
                                            disabled={msgToSend.length === 0}
                                            loading={sendLoading}
                                            icon={<SendOutlined />}
                                        >
                                            {sendLoading ? 'Sending…' : 'Send'}
                                        </Button>
                                    </div>
                                    <p className="deck-note">Files download on the other phone automatically. Messages are copied to its clipboard.</p>
                            </div>
                        </li>
                    </ol>
                )}

                {peer.started && (
                    <section className="deck-history" aria-label="Transfer history">
                        <h2 className="deck-history-title">History</h2>
                        {history.entries.length === 0 ? (
                            <p className="deck-history-empty">Nothing sent or received yet this session. Your transfers will show up here.</p>
                        ) : (
                            <div className="deck-history-card">
                                <ul className="deck-history-list">
                                    {history.entries.map(entry => (
                                        <li key={entry.id} className="deck-history-item">
                                            <span className={`deck-history-direction ${entry.kind.startsWith('sent') ? 'deck-history-direction-sent' : 'deck-history-direction-received'}`} aria-hidden="true">
                                                {entry.kind.startsWith('sent') ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                            </span>
                                            <span className="deck-history-type" aria-hidden="true">
                                                {entry.kind.endsWith('file') ? <FileOutlined /> : <MessageOutlined />}
                                            </span>
                                            <span className="deck-history-label">
                                                {entry.kind === 'sent-file' && `Sent file ${entry.label}`}
                                                {entry.kind === 'sent-msg' && `Sent “${entry.label}”`}
                                                {entry.kind === 'received-file' && `Received file ${entry.label}`}
                                                {entry.kind === 'received-msg' && `Received “${entry.label}”`}
                                            </span>
                                            <span className="deck-history-peer">{entry.peerId}</span>
                                            <time className="deck-history-time">{formatTime(entry.at)}</time>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </ConfigProvider>
    )
}

export default App
