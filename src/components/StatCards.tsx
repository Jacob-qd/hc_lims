import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';

interface StatCard {
  title: string;
  value: number | string;
  suffix?: string;
  valueStyle?: React.CSSProperties;
  prefix?: React.ReactNode;
  color?: string;
}

interface StatCardsProps {
  cards: StatCard[];
  gutter?: number | [number, number];
  span?: number;
}

export const StatCards: React.FC<StatCardsProps> = ({ cards, gutter = [16, 16], span = 6 }) => (
  <Row gutter={gutter} className="stat-cards-row">
    {cards.map((card, i) => (
      <Col xs={span * 2} sm={span} key={i}>
        <Card size="small">
          <Statistic
            title={card.title}
            value={card.value}
            suffix={card.suffix}
            valueStyle={card.valueStyle || { color: card.color }}
            prefix={card.prefix}
          />
        </Card>
      </Col>
    ))}
  </Row>
);
