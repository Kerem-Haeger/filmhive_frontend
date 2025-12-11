import MainNavbar from "./MainNavbar";
import { Container } from "react-bootstrap";

function Layout({ children }) {
  return (
    <div className="fh-app">
      <MainNavbar />
      <main className="fh-main">
        <Container className="py-4">
          {children}
        </Container>
      </main>
      {/* optional footer later */}
    </div>
  );
}

export default Layout;
