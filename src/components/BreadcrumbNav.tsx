import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const routeLabels: Record<string, string> = {
  '/dashboard': '首页',
  '/samples': '样品管理',
  '/tasks': '检测管理',
  '/reports': '报告管理',
  '/quality': '质量控制',
  '/instruments': '仪器管理',
  '/inventory': '库存管理',
  '/methods': '方法管理',
  '/personnel': '人员与培训',
  '/clients': '客户管理',
  '/contracts': '合同管理',
  '/settings': '系统管理',
  '/statistics': '数据分析',
  '/query': '综合查询',
  '/schedules': '排期管理',
  '/research/groups': '课题组管理',
  '/research/projects': '研究项目管理',
  '/research/eln': '电子实验记录',
  '/research/reservations': '仪器共享预约',
  '/teaching': '教学实验管理',
  '/safety': '安全与废弃物',
  '/achievements': '成果管理',
  '/portal': '客户自助门户',
};

export const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathParts = location.pathname.split('/').filter(Boolean);

  const items = [
    { title: <><HomeOutlined /> <a onClick={() => navigate('/dashboard')}>首页</a></> },
    ...pathParts.reduce((acc: unknown[], part, i) => {
      const path = '/' + pathParts.slice(0, i + 1).join('/');
      const label = routeLabels[path] || part;
      acc.push({ title: i === pathParts.length - 1 ? label : <a onClick={() => navigate(path)}>{label}</a> });
      return acc;
    }, []),
  ];

  return <Breadcrumb items={items} style={{ margin: '12px 0' }} />;
};
