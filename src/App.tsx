import React, { useState } from 'react';
import { Button, ConfigProvider, Input, Progress, message, QRCode, Upload, UploadFile } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, CheckOutlined, CloseOutlined, CopyOutlined, EnvironmentOutlined, FileOutlined, KeyOutlined, LinkOutlined, MessageOutlined, RadarChartOutlined, SendOutlined, UploadOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { changeDisplayName, startPeer, stopPeer } from "./store/peer/peerActions";
import * as connectionAction from "./store/connection/connectionActions"
import { acceptPeer, declinePeer, findNearby, joinCodeRoom, requestPeer } from "./store/discovery/discoveryActions";
import { addHistoryEntry } from "./store/history/historyActions";
import { Transport } from "./helpers/transport";
import { loadDisplayName } from "./helpers/displayName";
import { useAsyncState } from "./helpers/hooks";
import { useParams } from "react-router-dom"
import "./beam.css";

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
    const beamFill = !peer.started ? 0 : !isConnected ? 33 : history.entries.length === 0 ? 66 : 100
    const status = !peer.started
        ? { label: 'Not started', cls: '' }
        : !isConnected
            ? { label: 'Listening…', cls: 'is-listening' }
            : { label: `Connected to ${connection.list.length} device${connection.list.length === 1 ? '' : 's'}`, cls: 'is-live' }
    const unconnected = discovery.discovered.filter(p => !connection.list.includes(p.peerId))

    return (
        <ConfigProvider theme={{
            token: {
                colorPrimary: '#0f766e',
                colorLink: '#0f766e',
                colorText: '#16181d',
                colorTextSecondary: '#4a4f57',
                colorError: '#cf222e',
                colorBgLayout: '#f6f4ef',
                borderRadius: 6,
            }
        }}>
            <main className="beam-page">
                <header className="beam-header">
                    <h1 className="beam-title">P2P File Transfer</h1>
                    <span className={`beam-status ${status.cls}`} role="status">
                        <span className="beam-dot-signal" aria-hidden="true" />
                        {status.label}
                    </span>
                </header>
                <p className="beam-tagline">Send a file straight to the phone next to you. No server, no upload. The beam goes direct.</p>

                {!peer.started && (
                    <section className="beam-start-panel" aria-label="Start a session">
                        <p>Start a session and your ID and QR code appear here. The other phone scans it, connects, and you send.</p>
                        <label className="beam-name-label" htmlFor="displayName">Your name on the other phone</label>
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
                    <ol className="beam-steps" style={{ '--beam-fill': `${beamFill}%` } as React.CSSProperties}>
                        <li className={`beam-step ${peer.started ? 'is-done' : ''}`}>
                            <span className="beam-step-dot" aria-hidden="true">{peer.started ? <CheckOutlined /> : '1'}</span>
                            <div className="beam-step-body">
                                <h2 className="beam-step-title">Your signal</h2>
                                <p className="beam-step-hint">This is your address. The other phone scans the code, or opens your link.</p>
                                <div className="beam-qr-panel">
                                    <svg className="beam-qr-arcs" viewBox="0 0 120 120" aria-hidden="true">
                                        <path d="M 118 4 A 114 114 0 0 0 4 118" fill="none" stroke="#2dd4a8" strokeWidth="2" />
                                        <path d="M 118 28 A 90 90 0 0 0 28 118" fill="none" stroke="#2dd4a8" strokeWidth="2" opacity="0.6" />
                                        <path d="M 118 52 A 66 66 0 0 0 52 118" fill="none" stroke="#2dd4a8" strokeWidth="2" opacity="0.35" />
                                    </svg>
                                    <div className="beam-qr-card">
                                        <QRCode value={getUrlPrefix() + (peer.id || "")} size={216} bordered={false} />
                                    </div>
                                    <p className="beam-id-label">Your ID</p>
                                    <p className="beam-id">{peer.id}</p>
                                    <p className="beam-id-label">Appearing as</p>
                                    <p className="beam-display-name">{peer.displayName}</p>
                                    <Button onClick={async () => {
                                        await navigator.clipboard.writeText((getUrlPrefix() + peer.id) || "")
                                        message.info("Copied: " + getUrlPrefix() + peer.id)
                                    }} icon={<CopyOutlined />}>Copy link</Button>
                                    <div>
                                        <Button type="text" className="beam-stop" danger onClick={handleStopSession}>Stop session</Button>
                                    </div>
                                </div>
                            </div>
                        </li>

                        <li className={`beam-step ${isConnected ? 'is-done' : 'is-now'}`}>
                            <span className="beam-step-dot" aria-hidden="true">{isConnected ? <CheckOutlined /> : '2'}</span>
                            <div className="beam-step-body">
                                <h2 className="beam-step-title">Connect</h2>
                                <p className="beam-step-hint">Find the other phone nearby, join the same code, or paste its ID, then tap it and wait for the other side to accept.</p>
                                <div className="beam-panel">
                                    {discovery.incoming.length > 0 && (
                                        <div className="beam-requests" role="group" aria-label="Connection requests">
                                            {discovery.incoming.map(req => (
                                                <div key={req.peerId} className="beam-request">
                                                    <span className="beam-request-text"><strong>{req.name}</strong> wants to connect</span>
                                                    <div className="beam-request-actions">
                                                        <Button type="primary" onClick={() => dispatch(acceptPeer(req.peerId))}>Accept</Button>
                                                        <Button onClick={() => dispatch(declinePeer(req.peerId))} icon={<CloseOutlined />}>Decline</Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <h3 className="beam-connect-title"><EnvironmentOutlined /> Nearby devices</h3>
                                    <p className="beam-note beam-note-tight">Uses your approximate area only, never your exact location.</p>
                                    <Button
                                        block
                                        onClick={() => dispatch(findNearby())}
                                        loading={discovery.nearbyLocating}
                                        disabled={discovery.nearbyActive}
                                        icon={<RadarChartOutlined />}
                                    >
                                        {discovery.nearbyActive ? 'Looking for devices nearby…' : 'Find nearby devices'}
                                    </Button>
                                    {discovery.nearbyError && <p className="beam-error" role="alert">{discovery.nearbyError}</p>}

                                    <h3 className="beam-connect-title"><KeyOutlined /> Join with a code</h3>
                                    <div className="beam-row">
                                        <Input
                                            placeholder="4–6 letter code"
                                            value={codeInput}
                                            maxLength={6}
                                            onChange={e => setCodeInput(e.target.value)}
                                            aria-label="Short code"
                                        />
                                        <Button onClick={() => { dispatch(joinCodeRoom(codeInput)); setCodeInput("") }}>Join</Button>
                                    </div>
                                    {discovery.codeRoom && <p className="beam-note">In code room “{discovery.codeRoom}”. The other phone enters the same code.</p>}

                                    <h3 className="beam-connect-title"><LinkOutlined /> Paste an ID or link code</h3>
                                    <div className="beam-row">
                                        <Input
                                            placeholder="Phone ID"
                                            value={connection.id}
                                            onChange={e => dispatch(connectionAction.changeConnectionInput(e.target.value))}
                                            required={true}
                                            aria-label="Other phone's ID"
                                        />
                                        <Button type="primary" onClick={handleConnectOtherPeer} loading={connection.loading}>Connect</Button>
                                    </div>

                                    {unconnected.length > 0 && (
                                        <div className="beam-peer-list" style={{ marginTop: 16 }}>
                                            {unconnected.map(found => {
                                                const requested = discovery.outgoing.includes(found.peerId)
                                                return (
                                                    <button
                                                        key={found.peerId}
                                                        type="button"
                                                        className="beam-peer beam-peer-stacked"
                                                        disabled={requested}
                                                        onClick={() => dispatch(requestPeer(found.peerId))}
                                                    >
                                                        <span className="beam-peer-top">
                                                            <span className="beam-peer-name">{found.name}</span>
                                                            <span className="beam-peer-via">{viaLabel(found.via)}</span>
                                                        </span>
                                                        <span className="beam-peer-bottom">
                                                            <span className="beam-peer-id">{found.peerId.slice(0, 8)}</span>
                                                            <span className="beam-peer-state">{requested ? 'Request sent…' : 'Tap to connect'}</span>
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {connection.list.length === 0 ? (
                                        <p className="beam-note">
                                            {unconnected.length === 0 && <><span className="beam-dot-signal" aria-hidden="true" /> Listening for a device…</>}
                                        </p>
                                    ) : (
                                        <div className="beam-peer-list" style={{ marginTop: 12 }}>
                                            {connection.list.map(peerId => (
                                                <button
                                                    key={peerId}
                                                    type="button"
                                                    className={`beam-peer beam-peer-stacked ${connection.selectedId === peerId ? 'is-selected' : ''}`}
                                                    aria-pressed={connection.selectedId === peerId}
                                                    onClick={() => dispatch(connectionAction.selectItem(peerId))}
                                                >
                                                    <span className="beam-peer-top">
                                                        <span className="beam-peer-name">{nameOf(peerId)}</span>
                                                        <span className="beam-signal-bars" aria-hidden="true"><i /><i /><i /><i /></span>
                                                    </span>
                                                    <span className="beam-peer-bottom">
                                                        <span className="beam-peer-id">{peerId.slice(0, 8)}</span>
                                                        <span className="beam-peer-state">Connected</span>
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>

                        <li className={`beam-step ${history.entries.length > 0 ? 'is-done' : isConnected ? 'is-now' : ''}`}>
                            <span className="beam-step-dot" aria-hidden="true">{history.entries.length > 0 ? <CheckOutlined /> : '3'}</span>
                            <div className="beam-step-body">
                                <h2 className="beam-step-title">Send</h2>
                                <p className="beam-step-hint">
                                    {connection.selectedId
                                        ? <>Sending to <span style={{ display: 'inline', wordBreak: 'break-all' }}>{nameOf(connection.selectedId)}</span>. Pick a file or write a message.</>
                                        : 'Connect to a device first, then pick a file or write a message.'}
                                </p>
                                <div className="beam-panel">
                                    {discovery.receiving && (
                                        <p className="beam-note beam-note-tight" role="status">
                                            Receiving {discovery.receiving.name}… {discovery.receiving.percent}%
                                        </p>
                                    )}
                                    <div className={`beam-file-zone ${fileList.length > 0 ? 'has-file' : ''}`}>
                                        {fileList.length > 0 ? (
                                            <>
                                                <span className="beam-file-name"><FileOutlined /> {(fileList[0] as unknown as File).name}</span>
                                                <Button type="primary" onClick={() => handleUpload('file')} loading={sendLoading} icon={<SendOutlined />}>
                                                    {sendLoading ? 'Sending…' : 'Send file'}
                                                </Button>
                                                {sendProgress !== null && (
                                                    <div className="beam-progress">
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
                                    <div className="beam-divider">Or</div>
                                    <div className="beam-msg-row">
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
                                    <p className="beam-note">Files download on the other phone automatically. Messages are copied to its clipboard.</p>
                                </div>
                            </div>
                        </li>
                    </ol>
                )}

                {peer.started && (
                    <section className="beam-history" aria-label="Transfer history">
                        <h2 className="beam-history-title">History</h2>
                        {history.entries.length === 0 ? (
                            <p className="beam-history-empty">Nothing sent or received yet this session. Your transfers will show up here.</p>
                        ) : (
                            <ul className="beam-history-list">
                                {history.entries.map(entry => (
                                    <li key={entry.id} className="beam-history-item">
                                        {entry.kind.startsWith('sent') ? <ArrowUpOutlined aria-hidden="true" /> : <ArrowDownOutlined aria-hidden="true" />}
                                        {entry.kind.endsWith('file') ? <FileOutlined aria-hidden="true" /> : <MessageOutlined aria-hidden="true" />}
                                        <span className="beam-history-label">
                                            {entry.kind === 'sent-file' && `Sent file ${entry.label}`}
                                            {entry.kind === 'sent-msg' && `Sent “${entry.label}”`}
                                            {entry.kind === 'received-file' && `Received file ${entry.label}`}
                                            {entry.kind === 'received-msg' && `Received “${entry.label}”`}
                                        </span>
                                        <span className="beam-history-peer">{entry.peerId}</span>
                                        <time className="beam-history-time">{formatTime(entry.at)}</time>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}
            </main>
        </ConfigProvider>
    )
}

export default App
