import { useContext, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // optional
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const canSubmit = useMemo(() => {
    return (
      username.trim().length > 0 &&
      password1.length > 0 &&
      password2.length > 0 &&
      !isSubmitting
    );
  }, [username, password1, password2, isSubmitting]);

  const parseApiErrors = (err) => {
    const data = err?.response?.data;
    if (!data || typeof data !== "object") {
      return {
        formError: "Registration failed. Please try again.",
        fieldErrors: {},
      };
    }

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
      nextFormError = "Registration failed. Please check your details.";
    }

    return { formError: nextFormError, fieldErrors: nextFieldErrors };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});

    if (password1 !== password2) {
      setFieldErrors({ password2: "Passwords do not match." });
      return;
    }

    const cleanedUsername = username.trim();
    const cleanedEmail = email.trim(); // optional

    setIsSubmitting(true);
    try {
      await register({
        username: cleanedUsername,
        email: cleanedEmail,
        password1,
        password2,
      });
      navigate("/films");
    } catch (err) {
      console.error(err);
      const parsed = parseApiErrors(err);
      setFormError(parsed.formError);
      setFieldErrors(parsed.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 className="fh-page-title">Register</h1>

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
          <Form.Label>
            Email <span className="text-muted">(optional)</span>
          </Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            isInvalid={Boolean(fieldErrors.email)}
          />
          <Form.Control.Feedback type="invalid">
            {fieldErrors.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
            autoComplete="new-password"
            required
            isInvalid={Boolean(fieldErrors.password1)}
          />
          <Form.Control.Feedback type="invalid">
            {fieldErrors.password1}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm password</Form.Label>
          <Form.Control
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            required
            isInvalid={Boolean(fieldErrors.password2)}
          />
          <Form.Control.Feedback type="invalid">
            {fieldErrors.password2}
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="warning" type="submit" disabled={!canSubmit}>
          {isSubmitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" /> Creating
              account...
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
