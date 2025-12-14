import { Form, Button, Badge, Row, Col } from "react-bootstrap";
import { useState } from "react";

function FilterBar({
  sortBy = "title",
  onSortChange,
  selectedGenres = [],
  onGenreToggle,
  yearRange = { min: "", max: "" },
  onYearRangeChange,
  onReset,
  activeFilterCount = 0,
  availableGenres = [],
}) {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: "", label: "None" },
    { value: "title", label: "Title (A-Z)" },
    { value: "year_desc", label: "Year (Newest)" },
    { value: "year_asc", label: "Year (Oldest)" },
    { value: "rating_desc", label: "Rating (Highest)" },
    { value: "rating_asc", label: "Rating (Lowest)" },
    { value: "popularity_desc", label: "Popularity (Highest)" },
  ];

  return (
    <div className="mb-4">
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
        <div style={{ minWidth: "200px" }}>
          <Form.Group className="mb-0">
            <Form.Label className="mb-1 small">Sort by</Form.Label>
            <Form.Control
              as="select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              size="sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>

        <Button
          variant="outline-light"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="mt-auto"
        >
          {showFilters ? "Hide" : "Show"} Filters
          {activeFilterCount > 0 && (
            <Badge bg="warning" className="ms-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={onReset}
            className="mt-auto"
          >
            Clear All
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="border rounded p-3" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Genres</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {availableGenres.map((genre) => (
                    <Button
                      key={genre}
                      variant={
                        selectedGenres.includes(genre)
                          ? "info"
                          : "outline-secondary"
                      }
                      size="sm"
                      onClick={() => onGenreToggle(genre)}
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
                  />
                </div>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
