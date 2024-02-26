import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';

const AppRouter: React.FC = () => {
    return (
        <Router basename="/p2p-file-transfer">
            <Routes>
                <Route path="/:shareId*" element={<App />} />
            </Routes>
        </Router>
    );
}

export default AppRouter;
