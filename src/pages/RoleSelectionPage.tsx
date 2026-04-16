import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate('/auth?mode=signup', { replace: true });
  }, [navigate]);

  return null;
};

export default RoleSelectionPage;
