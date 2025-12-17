import MainNavbar from "./MainNavbar";
import { Container } from "react-bootstrap";
import { useContext } from "react";
import NotificationAlert from "./common/NotificationAlert";
import { NotificationContext } from "../context/NotificationContext";

function Layout({ children }) {
  const { successNotice, actionError, clearError } = useContext(NotificationContext) || {};
  return (
    <div className="fh-app">
      <MainNavbar />
      <main className="fh-main">
        <Container className="py-4">
          <NotificationAlert successNotice={successNotice} actionError={actionError} clearError={clearError} />
          {children}
        </Container>
      </main>
      {/* footer later */}
    </div>
  );
}

export default Layout;
