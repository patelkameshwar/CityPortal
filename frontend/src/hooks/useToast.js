import { toast } from 'react-toastify';

export const useToast = () => {
  const success = (message) => toast.success(message);
  const error = (message) => toast.error(message);
  const info = (message) => toast.info(message);
  
  return { success, error, info };
};

