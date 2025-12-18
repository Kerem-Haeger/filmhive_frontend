import { Form, Button } from "react-bootstrap";

function SearchBar({ searchTerm, onSearchChange, onClear, resultCount, totalCount }) {
  const showResultCount = resultCount !== totalCount;

  return (
    <div className="flex-grow-1 position-relative">
      <Form onSubmit={(e) => e.preventDefault()}>
        <div className="input-group fh-input-group">
          <Form.Control
            type="search"
            placeholder="Search by title, year, genre, people..."
            value={searchTerm}
            onChange={onSearchChange}
            className="fh-form-input"
          />
          {searchTerm && (
            <div className="input-group-append">
              <Button
                variant="outline-secondary"
                type="button"
                onClick={onClear}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </Form>
      {showResultCount && (
        <small className="text-muted position-absolute fh-search-hint">
          {resultCount} {resultCount === 1 ? 'film' : 'films'} found
        </small>
      )}
    </div>
  );
}

export default SearchBar;
