import { Route, Routes } from "react-router-dom";
import ShellLayout from "../layouts/ShellLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import BookDetailsPage from "../pages/BookDetailsPage.jsx";
import BookFormPage from "../pages/BookFormPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ShellLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="books/:bookId" element={<BookDetailsPage />} />
        <Route
          path="books/new"
          element={
            <ProtectedRoute>
              <BookFormPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="books/:bookId/edit"
          element={
            <ProtectedRoute>
              <BookFormPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
