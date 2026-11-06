import React from 'react';
import { Button, ConfigProvider, Input, message, QRCode, Upload, UploadFile } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, CheckOutlined, CopyOutlined, FileOutlined, MessageOutlined, SendOutlined, UploadOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { startPeer, stopPeerSession } from "./store/peer/peerActions";
import * as connectionAction from "./store/connection/connectionActions"
import { addHistoryEntry } from "./store/history/historyActions";
import { Data, DataType, PeerConnection } from "./helpers/peer";
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
    const dispatch = useAppDispatch()

    const handleStartSession = () => {
        dispatch(startPeer())
            .then(function () {
                if (shareId) {
                    dispatch(connectionAction.changeConnectionInput(shareId))
                }
            })
    }

    const handleStopSession = async () => {
        await PeerConnection.closePeerSession()
        dispatch(stopPeerSession())
    }

    const handleConnectOtherPeer = () => {
        connection.id != null ? dispatch(connectionAction.connectPeer(connection.id || "")) : message.warning("Please enter ID")
    }

    const [fileList, setFileList] = useAsyncState([] as UploadFile[])
    const [sendLoading, setSendLoading] = useAsyncState(false)
    const [msgToSend, setMsgToSend] = useAsyncState("")

    const handleUpload = async (dataType: DataType) => {
        if (!connection.selectedId) {
            message.warning("Please select a connection")
            return
        }

        let data: Data = {
            dataType: DataType.MSG,
            message: msgToSend
        }

        try {
            if (dataType === DataType.FILE) {
                if (fileList.length === 0) {
                    message.warning("Please select file")
                    return
                }
                await setSendLoading(true);
                let file = fileList[0] as unknown as File;
                let blob = new Blob([file], { type: file.type });

                data = {
                    dataType: DataType.FILE,
                    file: blob,
                    fileName: file.name,
                    fileType: file.type
                }
            }

            await PeerConnection.sendConnection(connection.selectedId, data)
            if (dataType === DataType.FILE) {
                dispatch(addHistoryEntry('sent-file', (fileList[0] as unknown as File).name, connection.selectedId))
            } else {
                dispatch(addHistoryEntry('sent-msg', msgToSend, connection.selectedId))
            }
            await setSendLoading(false)
            message.info("Send successfully")
        } catch (err) {
            await setSendLoading(false)
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
            : { label: `Connected · ${connection.list.length} device${connection.list.length === 1 ? '' : 's'}`, cls: 'is-live' }

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
                <p className="beam-tagline">Send a file straight to the phone next to you. No server, no upload — the beam goes direct.</p>

                {!peer.started && (
                    <section className="beam-start-panel" aria-label="Start a session">
                        <p>Start a session and your ID and QR code appear here. The other phone scans it, connects, and you send.</p>
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
                                <p className="beam-step-hint">Paste the other phone&rsquo;s ID, or scan its QR with your camera — the link opens here with their ID already filled in.</p>
                                <div className="beam-panel">
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
                                    {connection.list.length === 0 ? (
                                        <p className="beam-note"><span className="beam-dot-signal" aria-hidden="true" /> Listening for a device…</p>
                                    ) : (
                                        <div className="beam-peer-list" style={{ marginTop: 12 }}>
                                            {connection.list.map(peerId => (
                                                <button
                                                    key={peerId}
                                                    type="button"
                                                    className={`beam-peer ${connection.selectedId === peerId ? 'is-selected' : ''}`}
                                                    aria-pressed={connection.selectedId === peerId}
                                                    onClick={() => dispatch(connectionAction.selectItem(peerId))}
                                                >
                                                    <span className="beam-peer-id">{peerId}</span>
                                                    <span className="beam-signal-bars" aria-hidden="true"><i /><i /><i /><i /></span>
                                                    <span className="beam-peer-state">Connected</span>
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
                                        ? <>Sending to <span style={{ display: 'inline', wordBreak: 'break-all', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 13 }}>{connection.selectedId}</span>. Pick a file or write a message.</>
                                        : 'Connect to a device first, then pick a file or write a message.'}
                                </p>
                                <div className="beam-panel">
                                    <div className={`beam-file-zone ${fileList.length > 0 ? 'has-file' : ''}`}>
                                        {fileList.length > 0 ? (
                                            <>
                                                <span className="beam-file-name"><FileOutlined /> {(fileList[0] as unknown as File).name}</span>
                                                <Button type="primary" onClick={() => handleUpload(DataType.FILE)} loading={sendLoading} icon={<SendOutlined />}>
                                                    {sendLoading ? 'Sending…' : 'Send file'}
                                                </Button>
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
                                    <div className="beam-divider">or</div>
                                    <div className="beam-msg-row">
                                        <Input
                                            placeholder="Write a message"
                                            onChange={e => setMsgToSend(e.target.value)}
                                            required={true}
                                            aria-label="Message to send"
                                        />
                                        <Button
                                            type="primary"
                                            onClick={() => handleUpload(DataType.MSG)}
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
                            <p className="beam-history-empty">Nothing sent or received yet this session — your transfers will show up here.</p>
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
