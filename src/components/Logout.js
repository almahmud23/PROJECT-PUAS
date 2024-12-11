import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');  // Clear JWT token from local storage
    navigate('/login');  
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default Logout;
