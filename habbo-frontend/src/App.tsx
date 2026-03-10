import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MePage } from "./pages/MePage";
import { CommunityPage } from "./pages/CommunityPage";
import { NewsPage } from "./pages/NewsPage";
import { ClientPage } from "./pages/ClientPage";
import { StaffPage } from "./pages/StaffPage";
import { StorePage } from "./pages/StorePage";
import { PhotosPage } from "./pages/PhotosPage";
import { OldStaffPage } from "./pages/OldStaffPage";
import { VIPListPage } from "./pages/VIPListPage";
import { RareValuesPage } from "./pages/RareValuesPage";
import { LeaderboardsPage } from "./pages/LeaderboardsPage";
import { EconomyGuidePage } from "./pages/EconomyGuidePage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/me" element={<MePage />} />
          <Route path="/me/page" element={<MePage />} />
          <Route path="/me/settings" element={<MePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/old-staff" element={<OldStaffPage />} />
          <Route path="/vip-list" element={<VIPListPage />} />
          <Route path="/rare-values" element={<RareValuesPage />} />
          <Route path="/leaderboards" element={<LeaderboardsPage />} />
          <Route path="/economy" element={<EconomyGuidePage />} />
          <Route path="/client" element={<ClientPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
