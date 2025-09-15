import Home from './Home';
 import Guest from './Guest';
 import { useAuthStore } from '../../store/auth.store.js';

const HomePage = () => {
  //return <Home />;
   const { user } = useAuthStore();

  return <div>{user ? <Home /> : <Guest />}</div>;
};

export default HomePage;
