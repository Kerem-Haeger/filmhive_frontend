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
      <footer className="fh-footer">
        <Container className="d-flex justify-content-end align-items-center">
          <a
            href="https://github.com/your-handle"
            className="fh-footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-github"></i>
            <span>Your Name</span>
          </a>
        </Container>
      </footer>
    </div>
  );
}

export default Layout;
