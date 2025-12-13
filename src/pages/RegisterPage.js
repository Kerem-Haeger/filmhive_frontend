import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password1 !== password2) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ username, email, password1, password2 });
      navigate("/films");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Try a different username/email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 className="fh-page-title">Register</h1>

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
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Confirm password</Form.Label>
          <Form.Control
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Form.Group>

        <Button variant="warning" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" /> Creating account...
            </>
          ) : (
            "Register"
          )}
        </Button>

        <div className="mt-3 text-muted">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </Form>
    </div>
  );
}

export default RegisterPage;
