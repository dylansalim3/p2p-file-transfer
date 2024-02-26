import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';

const AppRouter: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:shareId*" element={<App />} />
            </Routes>
        </Router>
    );
}

export default AppRouter;
