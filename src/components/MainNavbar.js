import { useContext } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function MainNavbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  return (
    <Navbar bg="dark" variant="dark" expand="md" sticky="top">
      <Container>
        <Navbar.Brand as={NavLink} to="/">
          FilmHive
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={NavLink} to="/films">
              Films
            </Nav.Link>
          </Nav>

          <Nav className="ml-auto">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  Register
                </Nav.Link>
              </>
            ) : (
              <>
                <Navbar.Text className="mr-3 text-muted">
                  {user?.username ? `Hi, ${user.username}` : "Logged in"}
                </Navbar.Text>
                <Nav.Link
                  as="button"
                  onClick={logout}
                  className="btn btn-link nav-link"
                  style={{ cursor: "pointer" }}
                >
                  Logout
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavbar;
