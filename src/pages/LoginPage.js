import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ username, password });
      navigate("/films");
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your username/password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 className="fh-page-title">Login</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={onSubmit}>
        <Form.Group>
          <Form.Label>Username</Form.Label>
          <Form.Control
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Form.Group>

        <Button variant="warning" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" /> Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>

        <div className="mt-3 text-muted">
          No account? <Link to="/register">Register</Link>
        </div>
      </Form>
    </div>
  );
}

export default LoginPage;
