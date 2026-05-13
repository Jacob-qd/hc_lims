import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const breadcrumbNameMap: Record<string, string> = {
  '/dashboard': '首页',
  '/samples': '样品管理',
  '/tasks': '检测管理',
  '/reports': '报告管理',
  '/schedules': '排程管理',
  '/clients': '客户管理',
  '/contracts': '合同管理',
  '/quality': '质控管理',
  '/instruments': '仪器设备',
  '/statistics': '统计分析',
  '/query': '数据查询',
  '/settings': '系统设置',
};

export const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const name = breadcrumbNameMap[url] || url;
    return {
      key: url,
      title: index === pathSnippets.length - 1 ? name : <Link to={url}>{name}</Link>,
    };
  });

  const breadcrumbItems = [
    {
      title: (
        <Link to="/dashboard">
          <HomeOutlined />
        </Link>
      ),
      key: 'home',
    },
    ...extraBreadcrumbItems,
  ];

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ margin: '16px 0' }}
    />
  );
};
