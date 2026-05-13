import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { useThemeStore } from './stores/themeStore';
import { router } from './router';

function App() {
  const { theme: mode } = useThemeStore();

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
