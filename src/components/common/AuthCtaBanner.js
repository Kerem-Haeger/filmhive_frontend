import { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";

function AuthCtaBanner() {
  const { isAuthenticated, isBooting } = useContext(AuthContext);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const previousAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    // Detect logout: was authenticated, now is not
    if (previousAuthRef.current && !isAuthenticated) {
      setHasLoggedOut(true);
    }
    previousAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  if (isBooting || isAuthenticated || hasLoggedOut) return null;

  return (
    <div className="fh-cta-banner mb-4">
      <Row className="align-items-center g-3 g-md-4">
        <Col md={5} className="order-md-first">
          <h2 className="fh-cta-title mb-3">Unlock your film experience!</h2>
          <div className="d-flex gap-2">
            <Button as={Link} to="/register" variant="warning" className="fw-semibold">
              Create your profile
            </Button>
            <Button as={Link} to="/login" variant="outline-light">
              Log in
            </Button>
          </div>
        </Col>
        <Col md={7} className="order-md-last">
          <p className="fh-cta-subtitle mb-3 mb-md-2">
            Create your profile to personalise your experience, discover films tailored to your taste, and connect with a community of film enthusiasts.
          </p>
          <div className="fh-cta-label mb-2">Get started with:</div>
          <div className="fh-cta-pills">
            <Link to="/register" className="fh-cta-pill">For You</Link>
            <Link to="/register" className="fh-cta-pill">Blend Mode</Link>
            <Link to="/register" className="fh-cta-pill">Watchlists</Link>
            <Link to="/register" className="fh-cta-pill">Favourites</Link>
            <Link to="/register" className="fh-cta-pill">Reviews</Link>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AuthCtaBanner;
