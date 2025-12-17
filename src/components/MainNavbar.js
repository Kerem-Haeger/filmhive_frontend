import { useContext } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function MainNavbar() {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const location = useLocation();

  // Keep full current path (including any query string) so we can return after login/register
  const from = location.pathname + location.search;

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
                <Nav.Link as={NavLink} to="/login" state={{ from }}>
                  Login
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register" state={{ from }}>
                  Register
                </Nav.Link>
              </>
            ) : (
              <>
                <NavDropdown
                  title={user?.username ? `Hi, ${user.username}` : "My Account"}
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={NavLink} to="/for-you">
                    For You
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/blend-mode">
                    Blend Mode
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/favourites">
                    <i className="bi bi-heart-fill"></i> Favorites
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/watchlists">
                    Watchlists
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MainNavbar;
