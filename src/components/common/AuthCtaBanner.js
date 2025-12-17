import { useContext } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";

function AuthCtaBanner() {
  const { isAuthenticated, isBooting } = useContext(AuthContext);

  if (isBooting || isAuthenticated) return null;

  return (
    <div className="fh-cta-banner mb-4">
      <Row className="align-items-center g-3 g-md-4">
        <Col md={7}>
          <h2 className="fh-cta-title mb-2">Unlock your film experience</h2>
          <p className="fh-cta-subtitle mb-3 mb-md-2">
            Create your profile to get a personalized <strong>For You</strong> page, build
            <strong> Watchlists</strong>, mark <strong>Favourites</strong>, and write <strong>Reviews</strong>.
          </p>
          <div className="fh-cta-pills">
            <span className="fh-cta-pill">For You</span>
            <span className="fh-cta-pill">Watchlists</span>
            <span className="fh-cta-pill">Favourites</span>
            <span className="fh-cta-pill">Reviews</span>
          </div>
        </Col>
        <Col md={5} className="d-flex gap-2 justify-content-md-end">
          <Button as={Link} to="/register" variant="warning" className="fw-semibold">
            Create your profile
          </Button>
          <Button as={Link} to="/login" variant="outline-light">
            Log in
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default AuthCtaBanner;
