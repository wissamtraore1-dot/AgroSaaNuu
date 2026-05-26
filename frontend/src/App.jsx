import AppRouter from './routes/AppRouter';
import Notification from './Components/common/Notification';
import Navbar from "./Components/layout/Navbar";

export default function App() {
  return (
    <>
      <Navbar />
      <AppRouter />
      <Notification />
    </>
  );
}