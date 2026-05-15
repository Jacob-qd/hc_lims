import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Space, message, Modal, Form, Select, Switch, TimePicker } from 'antd';
import { ClockCircleOutlined, PlusOutlined, PlayCircleOutlined, PauseCircleOutlined, HistoryOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const BatchSchedulerPage: React.FC = () => {
  const [tasks] = useState([
    { id:'t1', name:'月度样品统计报表', type:'报表', cron:'0 8 1 * *', schedule:'每月1日 08:00', lastRun:'2026-05-01 08:00', status:'running' },
    { id:'t2', name:'质控月度报告', type:'报表', cron:'0 8 1 * *', schedule:'每月1日 08:00', lastRun:'2026-05-01 08:00', status:'running' },
    { id:'t3', name:'每日备份', type:'备份', cron:'0 3 * * *', schedule:'每日 03:00', lastRun:'2026-05-15 03:00', status:'running' },
    { id:'t4', name:'仪器校准到期提醒', type:'通知', cron:'0 9 * * 1', schedule:'每周一 09:00', lastRun:'2026-05-12 09:00', status:'running' },
    { id:'t5', name:'样品逾期提醒', type:'通知', cron:'0 10 * * *', schedule:'每日 10:00', lastRun:'2026-05-15 10:00', status:'paused' },
    { id:'t6', name:'数据归档(30天前)', type:'归档', cron:'0 2 * * 0', schedule:'每周日 02:00', lastRun:'2026-05-11 02:00', status:'running' },
  ]);

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}><ClockCircleOutlined /> 批处理调度</Title></Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            Modal.confirm({ title: '新建定时任务', content: (
              <Form layout="vertical">
                <Form.Item label="任务名称"><input className="ant-input" placeholder="如: 周报自动生成" /></Form.Item>
                <Form.Item label="任务类型"><Select style={{width:'100%'}}><Option value="report">报表生成</Option><Option value="backup">数据备份</Option><Option value="notification">消息通知</Option><Option value="archive">数据归档</Option></Select></Form.Item>
                <Form.Item label="执行频率"><Select style={{width:'100%'}}><Option value="daily">每日</Option><Option value="weekly">每周</Option><Option value="monthly">每月</Option></Select></Form.Item>
                <Form.Item label="执行时间"><TimePicker style={{width:'100%'}} /></Form.Item>
              </Form>
            ), onOk: () => message.success('定时任务创建成功'), });
          }}>新建任务</Button>
        </Col>
      </Row>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="总任务数" value={tasks.length} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="运行中" value={tasks.filter(t=>t.status==='running').length} valueStyle={{color:'#52c41a'}} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已暂停" value={tasks.filter(t=>t.status==='paused').length} valueStyle={{color:'#faad14'}} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="最近运行" value={tasks[0]?.lastRun?.split(' ')[1] || '-'} /></Card></Col>
      </Row>

      <Card>
        <Table dataSource={tasks} rowKey="id" pagination={false} columns={[
          { title:'任务名称', dataIndex:'name' }, { title:'类型', dataIndex:'type', render:(s:string)=><Tag>{s}</Tag> },
          { title:'调度表达式', dataIndex:'cron' }, { title:'执行时间', dataIndex:'schedule' },
          { title:'上次执行', dataIndex:'lastRun' },
          { title:'状态', dataIndex:'status', render:(s:string)=><Tag color={s==='running'?'green':'orange'}>{s==='running'?'运行中':'已暂停'}</Tag> },
          { title:'操作', render:(_:any,r:any)=>(
            <Space>
              <Button size="small" icon={r.status==='running'?<PauseCircleOutlined />:<PlayCircleOutlined />}
                onClick={()=>message.success(r.status==='running'?'已暂停':'已恢复')}>{r.status==='running'?'暂停':'恢复'}</Button>
              <Button size="small" icon={<HistoryOutlined />} onClick={()=>message.info('执行记录: 最近7次均成功')}>历史</Button>
            </Space>
          )},
        ]} />
      </Card>
    </div>
  );
};
