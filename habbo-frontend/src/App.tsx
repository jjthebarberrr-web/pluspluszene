import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MePage } from "./pages/MePage";
import { CommunityPage } from "./pages/CommunityPage";
import { NewsPage } from "./pages/NewsPage";
import { ClientPage } from "./pages/ClientPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/me" element={<MePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/client" element={<ClientPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
