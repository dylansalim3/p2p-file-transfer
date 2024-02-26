import React from 'react';
import { Button, Card, Col, Input, Menu, MenuProps, message, Popover, QRCode, Row, Space, Typography, Upload, UploadFile } from "antd";
import { CopyOutlined, QrcodeOutlined, UploadOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { startPeer, stopPeerSession } from "./store/peer/peerActions";
import * as connectionAction from "./store/connection/connectionActions"
import { Data, DataType, PeerConnection } from "./helpers/peer";
import { useAsyncState } from "./helpers/hooks";
import { useParams } from "react-router-dom"

const { Title } = Typography
type MenuItem = Required<MenuProps>['items'][number]

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
        type,
    } as MenuItem;
}

export const App: React.FC = () => {
    const { '*': shareId } = useParams();
    console.log(shareId)

    const peer = useAppSelector((state) => state.peer)
    const connection = useAppSelector((state) => state.connection)
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
            await setSendLoading(false)
            message.info("Send successfully")
        } catch (err) {
            await setSendLoading(false)
            console.log(err)
            message.error(String(err))
        }
    }

    return (
        <Row justify={"center"} align={"top"}>
            <Col xs={24} sm={24} md={20} lg={16} xl={12}>
                <Card>
                    <Title level={2} style={{ textAlign: "center" }}>P2P File Transfer</Title>
                    <Card hidden={peer.started}>
                        <Button onClick={handleStartSession} loading={peer.loading}>Start</Button>
                    </Card>
                    <Card hidden={!peer.started}>
                        <Space direction="horizontal">
                            <div>ID: {peer.id}</div>
                            <Button icon={<CopyOutlined />} onClick={async () => {
                                console.log(window.location.href + peer.id)
                                await navigator.clipboard.writeText((window.location.href + peer.id) || "")
                                message.info("Copied: " + window.location.href + peer.id)
                            }} />
                            <Popover content={<QRCode value={window.location.href + (peer.id || "")} ></QRCode>}
                                title="Scan Me"
                                trigger="click">
                                <Button icon={<QrcodeOutlined />} />
                            </Popover>
                            <Button danger onClick={handleStopSession}>Stop</Button>
                        </Space>
                    </Card>
                    <div hidden={!peer.started}>
                        <Card>
                            <Space direction="horizontal">
                                <Input placeholder={"ID"}
                                    value={connection.id}
                                    onChange={e => dispatch(connectionAction.changeConnectionInput(e.target.value))}
                                    required={true}
                                />
                                <Button onClick={handleConnectOtherPeer}
                                    loading={connection.loading}>Connect</Button>
                            </Space>
                        </Card>

                        <Card title="Connection">
                            {
                                connection.list.length === 0
                                    ? <div>Waiting for connection ...</div>
                                    : <div>
                                        Select a connection
                                        <Menu selectedKeys={connection.selectedId ? [connection.selectedId] : []}
                                            onSelect={(item) => dispatch(connectionAction.selectItem(item.key))}
                                            items={connection.list.map(e => getItem(e, e, null))} />
                                    </div>
                            }

                        </Card>
                        <Card title="Send File">
                            <Upload fileList={fileList}
                                maxCount={1}
                                onRemove={() => setFileList([])}
                                beforeUpload={(file) => {
                                    setFileList([file])
                                    return false
                                }}>
                                <Button icon={<UploadOutlined />}>Select File</Button>
                            </Upload>
                            <Button
                                type="primary"
                                onClick={() => handleUpload(DataType.FILE)}
                                disabled={fileList.length === 0}
                                loading={sendLoading}
                                style={{ marginTop: 16 }}
                            >
                                {sendLoading ? 'Sending' : 'Send'}
                            </Button>
                        </Card>
                        <Card title="Send Message">
                            <Space direction="horizontal">
                                <Input placeholder={"MsgToSend"}
                                    onChange={e => setMsgToSend(e.target.value)}
                                    required={true}
                                />
                                <Button
                                    type="primary"
                                    onClick={() => handleUpload(DataType.MSG)}
                                    disabled={msgToSend.length === 0}
                                    loading={sendLoading}
                                >
                                    {sendLoading ? 'Sending' : 'Send'}
                                </Button>
                            </Space>
                        </Card>
                    </div>
                </Card>
            </Col>


        </Row>
    )
}

export default App
