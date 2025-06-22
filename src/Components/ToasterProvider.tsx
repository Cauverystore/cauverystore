// src/components/ToasterProvider.tsx
import { Toaster } from 'react-hot-toast';

const ToasterProvider = () => {
  return <Toaster position="top-center" reverseOrder={false} />;
};

export default ToasterProvider;
