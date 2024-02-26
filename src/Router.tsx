import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';

const AppRouter: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:shareId*" element={<App />} />
                {/* <Route path="/*" element={<App />} /> */}
            </Routes>
        </Router>
    );
}

export default AppRouter;
