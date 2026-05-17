/* eslint-disable react-refresh/only-export-components */
import React, { useMemo } from 'react';
import { Card, Tag, Row, Col, Typography, Alert, Statistic, Space, Divider } from 'antd';
import {
  CheckCircleOutlined, WarningOutlined, CloseCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface QCDataPoint {
  value: number;
  date: string;
  batch: string;
  analyte?: string;
}

interface WestgardResult {
  rule: string;
  description: string;
  level: 'pass' | 'warning' | 'error';
  detail: string;
}

/**
 * Westgard 多规则质控分析引擎
 * 对标金现代 LIMS 智能质控模块
 */
export function analyzeWestgardRules(data: QCDataPoint[], mean: number, sd: number): WestgardResult[] {
  const results: WestgardResult[] = [];
  const n = data.length;
  if (n === 0) return [];

  const lastVal = data[n - 1]?.value;

  // 1₂s：一个控制值超过 ±2s（警告规则）
  const exceeds2s = Math.abs(lastVal - mean) > 2 * sd;
  if (exceeds2s) {
    results.push({
      rule: '1₂s',
      description: '警告：控制值超过 ±2s',
      level: 'warning',
      detail: `值 ${lastVal.toFixed(2)} 超出均值 ${mean.toFixed(2)} ± ${(2*sd).toFixed(2)}`,
    });
  }

  // 1₃s：一个控制值超过 ±3s（失控规则）
  const exceeds3s = Math.abs(lastVal - mean) > 3 * sd;
  if (exceeds3s) {
    results.push({
      rule: '1₃s',
      description: '失控：控制值超过 ±3s',
      level: 'error',
      detail: `值 ${lastVal.toFixed(2)} 超出均值 ${mean.toFixed(2)} ± ${(3*sd).toFixed(2)}`,
    });
  }

  // 2₂s：两个连续控制值超过 ±2s
  if (n >= 2) {
    const bothExceed2s =
      Math.abs(data[n - 2]?.value - mean) > 2 * sd &&
      Math.abs(lastVal - mean) > 2 * sd;
    if (bothExceed2s) {
      results.push({
        rule: '2₂s',
        description: '失控：两个连续值超过 ±2s',
        level: 'error',
        detail: `最近两个值 ${data[n-2]?.value.toFixed(2)}, ${lastVal.toFixed(2)} 均超出 ±2s`,
      });
    }
  }

  // R₄s：两个控制值之差超过 4s
  if (n >= 2) {
    const diff = Math.abs(lastVal - data[n - 2]?.value);
    if (diff > 4 * sd) {
      results.push({
        rule: 'R₄s',
        description: '失控：两个值之差超过 4s',
        level: 'error',
        detail: `差值 ${diff.toFixed(2)} > ${(4*sd).toFixed(2)}`,
      });
    }
  }

  // 4₁s：连续四个控制值超过 ±1s（同一方向）
  if (n >= 4) {
    const lastFour = data.slice(-4);
    const allAbove = lastFour.every(d => d.value > mean + sd);
    const allBelow = lastFour.every(d => d.value < mean - sd);
    if (allAbove || allBelow) {
      results.push({
        rule: '4₁s',
        description: '失控：连续 4 个值超过 ±1s（趋势偏差）',
        level: 'error',
        detail: allAbove ? '连续 4 个值高于 X̅+s' : '连续 4 个值低于 X̅-s',
      });
    }
  }

  // 10x：连续 10 个值在均线同一侧（漂移）
  if (n >= 10) {
    const lastTen = data.slice(-10);
    const allOnSameSide = lastTen.every(d => d.value > mean) || lastTen.every(d => d.value < mean);
    if (allOnSameSide) {
      results.push({
        rule: '10x',
        description: '失控：连续 10 个值在均线同一侧（系统漂移）',
        level: 'error',
        detail: lastTen.every(d => d.value > mean)
          ? '连续 10 个值高于均值' : '连续 10 个值低于均值',
      });
    }
  }

  // 7T：连续 7 个值呈上升/下降趋势
  if (n >= 7) {
    const lastSeven = data.slice(-7);
    const isRising = lastSeven.every((d, i) => i === 0 || d.value >= lastSeven[i-1].value);
    const isFalling = lastSeven.every((d, i) => i === 0 || d.value <= lastSeven[i-1].value);
    if (isRising || isFalling) {
      results.push({
        rule: '7T',
        description: '失控：连续 7 个值呈单调趋势',
        level: 'error',
        detail: isRising ? '连续 7 个值上升' : '连续 7 个值下降',
      });
    }
  }

  return results;
}

/** Westgard 规则可视化组件 */
export const WestgardAnalyzer: React.FC<{
  data: QCDataPoint[];
  mean: number;
  sd: number;
  analyte: string;
}> = ({ data, mean, sd, analyte }) => {
  const results = useMemo(() => analyzeWestgardRules(data, mean, sd), [data, mean, sd]);

  const errorCount = results.filter(r => r.level === 'error').length;
  const warnCount = results.filter(r => r.level === 'warning').length;
  const pass = errorCount === 0 && warnCount === 0;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>{analyte}控制规则分析</Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="整体状态"
              value={pass ? '正常' : errorCount > 0 ? '失控' : '警告'}
              valueStyle={{ color: pass ? '#52c41a' : errorCount > 0 ? '#ff4d4f' : '#faad14' }}
              prefix={pass ? <CheckCircleOutlined /> : errorCount > 0 ? <CloseCircleOutlined /> : <WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="失控规则" value={errorCount} valueStyle={{ color: errorCount > 0 ? '#ff4d4f' : undefined }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="警告规则" value={warnCount} valueStyle={{ color: warnCount > 0 ? '#faad14' : undefined }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="最近数据点" value={data.length} />
          </Card>
        </Col>
      </Row>

      {pass ? (
        <Alert
          type="success"
          message="所有 Westgard 规则检查通过"
          description="质控状态正常，无需采取措施"
          showIcon
          icon={<CheckCircleOutlined />}
        />
      ) : (
        <>
          {results.filter(r => r.level === 'error').map((r, i) => (
            <Alert
              key={i}
              type="error"
              message={<Space><Tag color="red">{r.rule}</Tag>{r.description}</Space>}
              description={r.detail}
              showIcon
              icon={<CloseCircleOutlined />}
              style={{ marginBottom: 8 }}
            />
          ))}
          {results.filter(r => r.level === 'warning').map((r, i) => (
            <Alert
              key={i + 100}
              type="warning"
              message={<Space><Tag color="orange">{r.rule}</Tag>{r.description}</Space>}
              description={r.detail}
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 8 }}
            />
          ))}
          <Divider />
          <Text type="secondary">
            建议：{errorCount > 0 ? '立即停止检测，查找失控原因并采取纠正措施' : '持续监控，评估是否需要预防性维护'}
          </Text>
        </>
      )}

      <Divider>规则说明</Divider>
      <Row gutter={[8, 8]}>
        {[
          { rule: '1₂s', desc: '警告规则：1个值超出±2s', color: 'orange' },
          { rule: '1₃s', desc: '失控规则：1个值超出±3s', color: 'red' },
          { rule: '2₂s', desc: '失控规则：2个连续值超出±2s', color: 'red' },
          { rule: 'R₄s', desc: '失控规则：2值之差超过4s', color: 'red' },
          { rule: '4₁s', desc: '失控规则：4个连续值超出±1s', color: 'red' },
          { rule: '10x', desc: '失控规则：10个值在均线同侧', color: 'red' },
          { rule: '7T', desc: '失控规则：7个值呈单调趋势', color: 'red' },
        ].map(rule => (
          <Col span={8} key={rule.rule}>
            <Tag color={rule.color}>{rule.rule}</Tag>
            <Text type="secondary" style={{ fontSize: 11 }}>{rule.desc}</Text>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// Suppress the unused variable error in the ternary
