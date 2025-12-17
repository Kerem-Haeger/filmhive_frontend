import { useEffect } from "react";
import { Alert, Button } from "react-bootstrap";

function NotificationAlert({ successNotice, actionError, clearError }) {
  useEffect(() => {
    if (!actionError || typeof clearError !== "function") return;
    const timer = setTimeout(() => clearError(), 6000);
    return () => clearTimeout(timer);
  }, [actionError, clearError]);

  return (
    <>
      {successNotice && (
        <Alert
          variant="success"
          className="d-flex justify-content-between align-items-center"
        >
          <div>{successNotice.text}</div>
          {typeof successNotice.undo === "function" && (
            <Button
              size="sm"
              variant="outline-danger"
              onClick={successNotice.undo}
            >
              Undo
            </Button>
          )}
        </Alert>
      )}
      {actionError && <Alert variant="danger">{actionError}</Alert>}
    </>
  );
}

export default NotificationAlert;
