import { useContext, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const canSubmit = useMemo(() => {
    return username.trim().length > 0 && password.length > 0 && !isSubmitting;
  }, [username, password, isSubmitting]);

  const parseApiErrors = (err) => {
    const data = err?.response?.data;
    if (!data || typeof data !== "object") {
      return {
        formError: "Login failed. Please try again.",
        fieldErrors: {},
      };
    }

    // dj-rest-auth often returns { non_field_errors: [...] } or { detail: "..." }
    const nextFieldErrors = {};
    let nextFormError = "";

    for (const [key, val] of Object.entries(data)) {
      const messages = Array.isArray(val) ? val : [String(val)];
      if (key === "non_field_errors" || key === "detail") {
        nextFormError = messages.join(" ");
      } else {
        nextFieldErrors[key] = messages.join(" ");
      }
    }

    if (!nextFormError && Object.keys(nextFieldErrors).length === 0) {
      nextFormError = "Login failed. Check your username and password.";
    }

    return { formError: nextFormError, fieldErrors: nextFieldErrors };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    const cleanedUsername = username.trim();

    setIsSubmitting(true);
    try {
      await login({ username: cleanedUsername, password });
      navigate("/films");
    } catch (err) {
      console.error(err);
      const parsed = parseApiErrors(err);

      // If backend gives only a generic error, nudge user by highlighting fields
      const nextFieldErrors = { ...parsed.fieldErrors };
      if (!nextFieldErrors.username && !nextFieldErrors.password && parsed.formError) {
        nextFieldErrors.username = " ";
        nextFieldErrors.password = " ";
      }

      setFormError(parsed.formError);
      setFieldErrors(nextFieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 className="fh-page-title">Login</h1>

      {formError && <Alert variant="danger">{formError}</Alert>}

      <Form onSubmit={onSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            isInvalid={Boolean(fieldErrors.username)}
          />
          <Form.Control.Feedback type="invalid">
            {fieldErrors.username}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            isInvalid={Boolean(fieldErrors.password)}
          />
          <Form.Control.Feedback type="invalid">
            {fieldErrors.password}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="warning" type="submit" disabled={!canSubmit}>
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
