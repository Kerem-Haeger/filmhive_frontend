import { Alert, Button } from "react-bootstrap";

function NotificationAlert({ successNotice, actionError }) {
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
