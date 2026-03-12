import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
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
import { HousekeepingPage } from "./pages/HousekeepingPage";
import { EventStaffPage } from "./pages/EventStaffPage";
import { DJStaffPage } from "./pages/DJStaffPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { RoomPage } from "./pages/RoomPage";
import { HelpPage } from "./pages/HelpPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/post/:postId" element={<PostDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/old-staff" element={<OldStaffPage />} />
          <Route path="/vip-list" element={<VIPListPage />} />
          <Route path="/rare-values" element={<RareValuesPage />} />
          <Route path="/leaderboards" element={<LeaderboardsPage />} />
          <Route path="/economy" element={<EconomyGuidePage />} />
          <Route path="/housekeeping" element={<HousekeepingPage />} />
          <Route path="/event-staff" element={<EventStaffPage />} />
          <Route path="/dj-staff" element={<DJStaffPage />} />
          <Route path="/user/:username" element={<UserProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/client" element={<ClientPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
