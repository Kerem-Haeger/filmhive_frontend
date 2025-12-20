import { Form } from "react-bootstrap";

function SortControl({ sortBy, onSortChange }) {
  return (
    <div className="fh-width-sort-lg">
      <Form.Group controlId="sortControl" className="mb-0">
        <Form.Label className="sr-only">Sort films</Form.Label>
        <Form.Control
          as="select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="fh-form-select"
          aria-label="Sort films"
        >
          <option value="">Sort by...</option>
          <option value="title">Title (A-Z)</option>
          <option value="year_desc">Year (Newest)</option>
          <option value="year_asc">Year (Oldest)</option>
          <option value="rating_desc">Rating (Highest)</option>
          <option value="rating_asc">Rating (Lowest)</option>
          <option value="popularity_desc">Popularity</option>
        </Form.Control>
      </Form.Group>
    </div>
  );
}

export default SortControl;
