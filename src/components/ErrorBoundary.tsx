import React from 'react';
import { Result, Button } from 'antd';

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面加载异常"
          subTitle={this.state.error?.message || '未知错误'}
          extra={[
            <Button key="reload" type="primary" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>
              刷新页面
            </Button>,
            <Button key="home" onClick={() => window.location.href = '/'}>返回首页</Button>,
          ]}
        />
      );
    }
    return this.props.children;
  }
}
