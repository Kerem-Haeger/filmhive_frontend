import { Form, Button, Row, Col } from "react-bootstrap";

function FilterBar({
  show,
  selectedGenres = [],
  onGenreToggle,
  yearRange = { min: "", max: "" },
  onYearRangeChange,
  availableGenres = [],
}) {
  if (!show) return null;

  return (
    <div className="border rounded p-3 mb-3 fh-filter-bar">
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Genres</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {availableGenres.map((genre) => (
                <Button
                  key={genre}
                  variant="none"
                  size="sm"
                  onClick={() => onGenreToggle(genre)}
                  className={`fh-genre-btn ${
                    selectedGenres.includes(genre) ? "fh-genre-btn-active" : ""
                  }`}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-0">
            <Form.Label className="fw-bold">Year Range</Form.Label>
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                type="number"
                placeholder="Min"
                value={yearRange?.min || ""}
                onChange={(e) =>
                  onYearRangeChange({ ...yearRange, min: e.target.value })
                }
                size="sm"
                min="1900"
                max={new Date().getFullYear()}
                className="fh-form-input"
              />
              <span>to</span>
              <Form.Control
                type="number"
                placeholder="Max"
                value={yearRange?.max || ""}
                onChange={(e) =>
                  onYearRangeChange({ ...yearRange, max: e.target.value })
                }
                size="sm"
                min="1900"
                max={new Date().getFullYear()}
                className="fh-form-input"
              />
            </div>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
}

export default FilterBar;
