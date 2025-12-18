import { Form } from "react-bootstrap";

function SortControl({ sortBy, onSortChange }) {
  return (
    <div className="fh-width-sort-lg">
      <Form.Control
        as="select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="">Sort by...</option>
        <option value="title">Title (A-Z)</option>
        <option value="year_desc">Year (Newest)</option>
        <option value="year_asc">Year (Oldest)</option>
        <option value="rating_desc">Rating (Highest)</option>
        <option value="rating_asc">Rating (Lowest)</option>
        <option value="popularity_desc">Popularity</option>
      </Form.Control>
    </div>
  );
}

export default SortControl;
